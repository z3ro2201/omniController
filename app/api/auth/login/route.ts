// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { UserTableRow } from "@/types/MemberType";

async function getClientIp(): Promise<string> {
  const h = await headers();

  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const xri = h.get("x-real-ip");
  if (xri) return xri.trim();

  return "unknown";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { user_id?: string; user_pw?: string };
    const userId = body.user_id?.trim();
    const userPw = body.user_pw ?? "";

    if (!userId || !userPw) {
      return NextResponse.json({ message: "user_id/user_pw required" }, { status: 400 });
    }

    // 1) 유저 조회 (테이블/컬럼명 네 스키마 그대로)
    const [rows] = await db.execute<UserTableRow[]>("SELECT user_id, user_pw, user_name, isAdmin FROM user WHERE user_id = ? LIMIT 1", [userId]);

    const user = rows?.[0];
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 2) 비밀번호 검증 (bcrypt hash 기준)
    const ok = await bcrypt.compare(userPw, user.user_pw);
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 3) 토큰 생성 (Access=1h, Refresh=30d)
    const now = new Date();
    const accessExpire = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour
    const refreshExpire = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days

    const accessToken = sign(
      {
        user_id: user.user_id,
        user_name: user.user_name,
        isAdmin: user.isAdmin,
        tokenType: "access",
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "1h", issuer: "omniController" }
    );

    const refreshToken = sign(
      {
        user_id: user.user_id,
        tokenType: "refresh",
      },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "30d", issuer: "omniController" }
    );

    // 4) token 2개 + login_log 1개 트랜잭션 저장
    const ip = await getClientIp();

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // token 테이블: (user_id, token, create_at, expire, tokenType)
      await conn.execute("INSERT INTO token (user_id, token, create_at, expire, tokenType) VALUES (?, ?, ?, ?, ?)", [user.user_id, accessToken, now, accessExpire, "access"]);

      await conn.execute("INSERT INTO token (user_id, token, create_at, expire, tokenType) VALUES (?, ?, ?, ?, ?)", [user.user_id, refreshToken, now, refreshExpire, "refresh"]);

      // login_log 테이블: (user_id, login_datetime, ip)
      await conn.execute("INSERT INTO login_log (user_id, login_datetime, ip) VALUES (?, ?, ?)", [user.user_id, now, ip]);

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    // 5) 응답 (원하면 HttpOnly 쿠키로 저장 가능)
    const res = NextResponse.json({
      user: { user_id: user.user_id, user_name: user.user_name, isAdmin: user.isAdmin },
      accessToken,
      refreshToken,
      accessExpireAt: accessExpire.toISOString(),
      refreshExpireAt: refreshExpire.toISOString(),
    });

    // 쿠키 방식 원하면 아래 주석 해제
    // res.cookies.set("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 60 * 60, // 1h
    // });
    // res.cookies.set("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 60 * 60 * 24 * 30, // 30d
    // });

    return res;
  } catch (err) {
    return NextResponse.json({ message: "Server error", detail: String(err) }, { status: 500 });
  }
}
