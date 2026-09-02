import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PYQ_SESSION_COOKIE,
  ADMIN_PYQ_SESSION_MAX_AGE,
  adminPyqSessionToken,
} from "@/lib/adminPyqSession";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await adminPyqSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_PYQ_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: ADMIN_PYQ_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_PYQ_SESSION_COOKIE);
  return response;
}
