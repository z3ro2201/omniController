import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ resultCode: 200, resultMsg: "정상적으로 로그아웃 되었습니다." }, { status: 200 });

  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");

  return res;
}
