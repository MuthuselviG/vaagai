"use client";

import { usePathname } from "next/navigation";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        .pdf-watermark {
          display: none;
        }
        @media print {
          .pdf-watermark {
            display: block;
            width: 700px;
            height: 990px;
            margin: -430px auto;
            opacity: 0.1;
            transform: rotate(-25deg);
            pointer-events: none;
            z-index: 50;
          }
          .pdf-header, .pdf-footer {
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
      <div className="pdf-footer" style={{ display: "none" }}>
        © 2026 mcqpalagu.in — All rights reserved.
      </div>
    </>
  );
}

export function PdfWatermark() {
  return (
    <svg
      className="pdf-watermark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 1131"
    >
      <image href="/logo.png" x="270" y="370" width="260" height="173" />
      <text
        x="400"
        y="620"
        fontSize="60"
        fontFamily="sans-serif"
        fontWeight="800"
        fill="#10204F"
        textAnchor="middle"
      >
        mcqpalagu.in
      </text>
    </svg>
  );
}
