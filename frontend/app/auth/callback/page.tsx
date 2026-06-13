"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login");
        return;
      }

      const redirect = searchParams.get("redirect");
      const redirectSuffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";

      const { data: existingUser } = await supabase
        .from("users")
        .select("id, exam_target")
        .eq("id", session.user.id)
        .single();

      if (!existingUser) {
        const meta = session.user.user_metadata ?? {};
        await supabase.from("users").insert({
          id: session.user.id,
          email: session.user.email ?? null,
          phone: session.user.phone ?? null,
          name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "",
        });
      }

      const needsOnboarding = !existingUser || !existingUser.exam_target;

      if (needsOnboarding) {
        router.push(`/onboarding${redirectSuffix}`);
      } else {
        router.push(redirect || "/subjects");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#F4F5F9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Sora', sans-serif",
      fontSize: 15,
      color: "#9BA3BF",
      fontWeight: 500,
    }}>
      Signing you in...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
