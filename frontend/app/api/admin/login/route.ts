import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Fail closed if admin credentials are not configured
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD not configured");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      // Same error message for both — don't reveal which one is wrong
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set httpOnly cookie — never readable by JS
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", "1", {
      httpOnly: true,       // not accessible via JS
      secure: true,         // HTTPS only
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/admin-fun-panrom",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
