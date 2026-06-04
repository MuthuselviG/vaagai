"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LangToggle from "./LangToggle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeLangToggle({ initialLang }: { initialLang: "en" | "ta" }) {
  const [lang, setLangState] = useState<"en" | "ta">(initialLang);
  const router = useRouter();

  async function handleChange(l: "en" | "ta") {
    setLangState(l);
    document.cookie = `mcqpalagu_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem("mcqpalagu_lang", l);
    router.refresh();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ lang: l }).eq("id", user.id);
    }
  }

  return <LangToggle lang={lang} setLang={handleChange} />;
}
