"use client";

import { CSSProperties, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function PdfDownloadButton({
  style,
  children,
}: {
  style?: CSSProperties;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("download") !== "pdf") return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.gtag?.("event", "pdf_download", { page_path: pathname });
        window.print();
      }
    });
  }, [pathname]);

  async function handleClick() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(`${pathname}?download=pdf`)}`);
      return;
    }
    window.gtag?.("event", "pdf_download", { page_path: pathname });
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ fontFamily: "inherit", cursor: "pointer", ...style }}
    >
      {children}
    </button>
  );
}
