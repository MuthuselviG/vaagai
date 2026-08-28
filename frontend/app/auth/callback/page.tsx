"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

      const redirect = searchParams.get("redirect") || sessionStorage.getItem("postLoginRedirect");
      sessionStorage.removeItem("postLoginRedirect");
      const redirectSuffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";

      const { data: existingUser } = await supabase
        .from("users")
        .select("id, exam_target")
        .eq("id", session.user.id)
        .single();

      if (!existingUser) {
        const meta = session.user.user_metadata ?? {};
        const { error: upsertError } = await supabase.from("users").upsert({
          id: session.user.id,
          email: session.user.email ?? null,
          phone: session.user.phone ?? null,
          name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "",
        });
        if (upsertError) {
          console.error("Failed to create user row:", upsertError);
        }
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
