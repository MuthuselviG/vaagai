"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login");
        return;
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (existingUser) {
        router.push("/subjects");
      } else {
        router.push("/onboarding");
      }
    }

    handleCallback();
  }, [router]);

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
