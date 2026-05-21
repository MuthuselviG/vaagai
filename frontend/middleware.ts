import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "muthu.111.44@gmail.com";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin-fun-panrom")) {
    return NextResponse.next();
  }

  // Allow login page and login API — avoid redirect loop
  if (
    pathname === "/admin-fun-panrom/login" ||
    pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  // 1. Check admin_session cookie
  const adminSession = req.cookies.get("admin_session")?.value;
  if (adminSession !== "1") {
    return NextResponse.redirect(new URL("/admin-fun-panrom/login", req.url));
  }

  // 2. Check Supabase session email
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const accessToken = req.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/admin-fun-panrom/login", req.url));
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/subjects", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-fun-panrom/:path*"],
};
