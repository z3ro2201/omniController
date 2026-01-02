import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return NextResponse.json({ isLogin: false });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json(
      {
        resultCode: 200,
        resultData: {
          isLogin: true,
          user: {
            user_id: payload.user_id,
            user_name: payload.user_name,
            isAdmin: payload.isAdmin,
          },
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ resultCode: 403, resultData: { isLogin: false } }, { status: 403 });
  }
}
