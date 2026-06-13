"use client";

import { CSSProperties, ReactNode } from "react";

export default function PdfDownloadButton({
  style,
  children,
}: {
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{ fontFamily: "inherit", cursor: "pointer", ...style }}
    >
      {children}
    </button>
  );
}
