"use client";

import { usePathname } from "next/navigation";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        .q-watermark {
          display: none;
        }
        @media print {
          .q-watermark {
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300px;
            height: auto;
            transform: translate(-50%, -50%) rotate(-18deg);
            opacity: 0.18;
            pointer-events: none;
            z-index: 5;
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

export function QuestionWatermark() {
  return (
    <svg
      className="q-watermark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 120"
    >
      <text
        x="150"
        y="70"
        fontSize="40"
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
