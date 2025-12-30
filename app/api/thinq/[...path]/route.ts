// app/api/thinq/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { headers } from "next/headers";

export const runtime = "nodejs";

type RouteCtx = {
  params: Promise<{ path: string[] }>;
};
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const THINQ_BASE_URL = "https://api-kic.lgthinq.com";
const DEFAULT_COUNTRY = "KR";

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, "GET", path);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  const body = await safeReadJson(req);
  return proxy(req, "POST", path, body);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  const body = await safeReadJson(req);
  return proxy(req, "PUT", path, body);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, "DELETE", path);
}

async function safeReadJson(req: NextRequest): Promise<unknown | undefined> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

function buildTargetUrl(req: NextRequest, path: string[]) {
  const safePath = Array.isArray(path) ? path : [];
  const pathname = safePath.map(encodeURIComponent).join("/");

  const url = new URL(`${THINQ_BASE_URL}/${pathname}`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

  return url.toString();
}

async function pickForwardHeaders(req: NextRequest) {
  const h = await headers();
  const out: Record<string, string> = {};

  // 들어온 헤더 전달 (hop-by-hop 제거)
  for (const [k, v] of h.entries()) {
    const key = k.toLowerCase();
    if (key === "host" || key === "connection" || key === "content-length" || key === "transfer-encoding" || key === "keep-alive" || key === "proxy-authenticate" || key === "proxy-authorization" || key === "te" || key === "trailer" || key === "upgrade") {
      continue;
    }
    out[k] = v;
  }

  // cookie 보강
  const cookie = req.headers.get("cookie");
  if (cookie) out["cookie"] = cookie;

  // ✅ Authorization: Bearer {env.THINQ_PAT} 강제
  const pat = process.env.THINQ_PAT;
  if (!pat) throw new Error("THINQ_PAT is not set");

  out["Authorization"] = `Bearer ${pat}`;
  out["x-country"] = DEFAULT_COUNTRY;

  return out;
}

function decodeBodyToText(buf: Buffer) {
  // ThinQ가 거의 utf-8이지만, 깨질 수 있어도 "raw" 우선이라 그냥 utf-8로 밀어줌
  return buf.toString("utf-8");
}

function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function jsonWrap(payload: unknown, status: number) {
  // ✅ 무조건 JSON 리턴
  const res = NextResponse.json(payload, { status });
  res.headers.set("content-type", "application/json; charset=utf-8");
  return res;
}

async function proxy(req: NextRequest, method: HttpMethod, path: string[], body?: unknown) {
  const targetUrl = buildTargetUrl(req, path);

  let forwardHeaders: Record<string, string>;
  try {
    forwardHeaders = await pickForwardHeaders(req);
  } catch (e) {
    // 서버 내부 실패도 동일 포맷 유지
    return jsonWrap(
      {
        resultCode: 500,
        resultData: null,
        resultMessage: e instanceof Error ? e.message : "Header build failed",
      },
      500
    );
  }

  // POST/PUT + body + content-type 없으면 json 기본
  if ((method === "POST" || method === "PUT") && body !== undefined) {
    const hasContentType = Object.keys(forwardHeaders).some((k) => k.toLowerCase() === "content-type");
    if (!hasContentType) forwardHeaders["content-type"] = "application/json";
  }

  const config: AxiosRequestConfig = {
    url: targetUrl,
    method,
    headers: forwardHeaders,
    responseType: "arraybuffer",
    validateStatus: () => true, // 4xx/5xx도 throw 안 하고 그대로 받기
  };

  if (method === "POST" || method === "PUT") config.data = body;

  try {
    // axios 요청 이후 try 블록 안
    const res = await axios.request<ArrayBuffer>(config);

    const status = res.status;
    const buf = Buffer.from(res.data);
    const rawText = buf.toString("utf-8").trim();

    // 200 OK 인 경우만 resultData 포함
    if (status === 200) {
      let resultData: unknown = null;

      if (rawText.length > 0) {
        try {
          resultData = JSON.parse(rawText);
        } catch {
          // JSON이 아니면 그대로 문자열
          resultData = rawText;
        }
      }

      return jsonWrap(
        {
          resultCode: status,
          resultData,
        },
        status
      );
    }

    // ❌ 200이 아닌 경우: resultData 아예 없음
    return jsonWrap(
      {
        resultCode: status,
        resultMessage: rawText, // raw body 그대로
      },
      status
    );
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 500;

    // 네트워크/예외도 동일 규격 유지
    return jsonWrap(
      {
        resultCode: status,
        resultData: null,
        resultMessage: err.message,
      },
      status
    );
  }
}
