// middleware.js
import { NextResponse, NextRequest } from "next/server";
import isValidToken from "@/lib/is-valid-token";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // ✅ 무한루프 방지: auth, 정적파일, api 등 제외(필요에 맞게)
  if (pathname.startsWith("/auth") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  try {
    // API URL을 환경 변수에서 가져온다
    const API_URL = process.env.API_SERVER_URL;

    // accessToken 쿠키를 가져옴
    const accessToken = req.cookies.get("accessToken");

    // refreshToken 쿠키를 가져옴
    const refreshToken = req.cookies.get("refreshToken");

    // 토큰 유효성 검사
    const { isAccessTokenValid, isRefreshTokenValid } = isValidToken({ accessToken: accessToken?.value ?? "", refreshToken: refreshToken?.value ?? "" });

    // 리프레시 토큰이 유효하지 않을 경우 로그인 페이지로 리다이렉트
    if (!isRefreshTokenValid) {
      console.error("refreshToken 유효X");
      return NextResponse.redirect(new URL("/auth/logout?reason=expiredtoken", req.url), { status: 307 });
    }

    // 엑세스 토큰이 유효하지 않을 경우 액세스 토큰을 재발급
    if (!isAccessTokenValid) {
      // API를 호출해 새 액세스 토큰을 요청함
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          ...(refreshToken?.value && { Authorization: `Bearer ${refreshToken?.value}` }),
        },
        credentials: "include",
      });

      // 응답이 성공적이지 않으면 로그인 페이지로 리다이렉트
      if (!response.ok) {
        console.error("AccessToken 미유효, refresh 실패");
        return NextResponse.redirect(new URL("/auth/login", req.url), { status: 307 });
      }

      // 응답이 성공적이면 다음 요청을 처리
      if (response.ok) {
        const { accessToken } = await response.json();

        const res = NextResponse.redirect(req.url);
        if (accessToken) {
          res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });
        }

        return res;
      }
    }

    // 🔹 토큰이 있으면 (하지만 유효성 검사는 여기서 하지 않음) 다음으로 진행
    // 실제 서비스에서는 여기서 토큰의 유효성 (만료, 위조 등)을 검증하는 로직이 필요합니다.
    return NextResponse.next();
  } catch (error) {
    console.error("토큰 발급 중 오류 발생", error);
    return NextResponse.redirect(new URL("/auth/login", req.url), { status: 307 });
  }
}

export const config = {
  // ✅ API 라우트, Next.js 내부 파일, 정적 파일, 그리고 인증 관련 경로는 미들웨어에서 제외
  // 즉, /auth로 시작하는 경로는 이 미들웨어가 아예 실행되지 않습니다.
  matcher: ["/((?!api|_next/static|_next/image|auth|favicon.ico|manifest.json|robots.txt|sw.js|icons|logo|icon|.*\\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$).*)"],
};
