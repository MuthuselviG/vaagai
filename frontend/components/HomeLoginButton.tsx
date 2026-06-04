"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { T } from "../lib/tokens";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeLoginButton() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // null = still checking; true = logged in. Both cases: show nothing.
  if (loggedIn !== false) return null;

  return (
    <button
      onClick={() => router.push("/login")}
      style={{
        width: "100%",
        background: "#fff",
        border: `1.5px solid ${T.indigo}`,
        borderRadius: 16,
        padding: "16px",
        color: T.indigo,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Log In
    </button>
  );
}
