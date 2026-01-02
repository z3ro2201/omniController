import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { UserTableRow } from "@/types/MemberType";

const saltRounds = 12;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { user_id?: string; user_pw?: string; user_name?: string; isAdmin?: boolean };
    const userId = body.user_id?.trim();
    const userPw = body.user_pw ?? "";
    const userName = body.user_name?.trim();
    const isAdmin = body.isAdmin ?? false;
    console.log(`id:${userId}`);
    if (!userId || userId.length < 3) return NextResponse.json({ resultMsg: "아이디를 입력하세요.\n아이디는 3자리 이상이어야 합니다.", resultCode: 401 }, { status: 401 });
    if (!userPw || userPw.length < 10) return NextResponse.json({ resultMsg: "비밀번호를 입력하세요.\n비밀번호는 10자리 이상이어야 합니다.", resultCode: 401 }, { status: 401 });
    if (!userName || userName.length < 2) return NextResponse.json({ resultMsg: "사용자 이름을 입력하세요.\n이름은 2자리 이상이어야 합니다.", resultCode: 401 }, { status: 401 });

    // 사용자 조회
    const [rows] = await db.execute<UserTableRow[]>("SELECT user_id FROM user WHERE user_id = ? LIMIT 1", [userId]);
    const user = rows?.[0];
    if (user) return NextResponse.json({ resultMsg: "해당 아이디는 사용중인 아이디입니다.\n다른 아이디를 입력하세요.", resultCode: 409 }, { status: 409 });

    // 비밀번호 생성
    const hashPasswd = await bcrypt.hash(userPw, saltRounds);

    // 관리자여부
    const admin = isAdmin ? 1 : 0;

    // DB 저장
    const sql = "INSERT INTO user (user_id, user_pw, user_name, isAdmin) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(sql, [userId, hashPasswd, userName, admin]);

    return NextResponse.json({ resultMsg: `${userId}(${userName})님의 아이디를 생성하였습니다.`, resultCode: 200 }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ resultMsg: `처리과정중 문제가 발생했습니다.`, error, resultCode: 500 }, { status: 500 });
  }
}
