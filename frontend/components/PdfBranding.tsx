"use client";

import { usePathname } from "next/navigation";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        @media print {
          .pdf-header, .pdf-watermark, .pdf-footer {
            display: flex !important;
          }
          .pdf-header {
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            font-size: 11px;
            color: #6B7280;
            font-family: sans-serif;
            border-bottom: 1px solid #E5E7EB;
          }
          .pdf-header img {
            height: 26px;
          }
          .pdf-watermark {
            align-items: center;
            justify-content: center;
            flex-direction: column;
            opacity: 0.15;
            padding: 28px 0;
          }
          .pdf-watermark img {
            width: 60vw;
            max-width: 420px;
          }
          .pdf-watermark span {
            font-size: 42px;
            font-weight: 800;
            font-family: sans-serif;
            color: #10204F;
            margin-top: 10px;
            letter-spacing: 2px;
          }
          .pdf-footer {
            justify-content: center;
            padding: 8px 0;
            font-size: 10px;
            color: #9CA3AF;
            font-family: sans-serif;
            border-top: 1px solid #E5E7EB;
            margin-top: 4px;
            margin-bottom: 16px;
          }
        }
      `}</style>
      <div className="pdf-header" style={{ display: "none" }}>
        <img src="/logo.png" alt="mcqpalagu.in" />
        <span>{url}</span>
      </div>
      <div className="pdf-watermark" style={{ display: "none" }}>
        <img src="/logo.png" alt="" />
        <span>mcqpalagu.in</span>
      </div>
      <div className="pdf-footer" style={{ display: "none" }}>
        © 2026 mcqpalagu.in — All rights reserved.
      </div>
    </>
  );
}
