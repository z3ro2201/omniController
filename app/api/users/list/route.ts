import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserTableRow } from "@/types/MemberType";

export async function POST(req: Request) {
  try {
    // 사용자 조회
    const [rows] = await db.execute<UserTableRow[]>("SELECT * FROM user");

    return NextResponse.json({ resultMsg: "목록조회 성공", resultCode: 200, resultData: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ resultMsg: `처리과정중 문제가 발생했습니다.`, error, resultCode: 500 }, { status: 500 });
  }
}
