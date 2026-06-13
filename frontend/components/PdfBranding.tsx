"use client";

import { usePathname } from "next/navigation";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        @media print {
          .pdf-header {
            display: flex !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            font-size: 10px;
            color: #6B7280;
            font-family: sans-serif;
            border-bottom: 1px solid #E5E7EB;
            background: white;
            z-index: 10000;
          }
          .pdf-footer {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 6px 0;
            font-size: 9px;
            color: #9CA3AF;
            font-family: sans-serif;
            border-top: 1px solid #E5E7EB;
            background: white;
            z-index: 10000;
          }
          .pdf-watermark {
            display: flex !important;
            position: fixed;
            inset: 0;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            opacity: 0.07;
            z-index: 1;
            pointer-events: none;
          }
          .pdf-watermark img {
            width: 55vw;
          }
          .pdf-watermark span {
            font-size: 46px;
            font-weight: 800;
            font-family: sans-serif;
            color: #10204F;
            margin-top: 14px;
            letter-spacing: 2px;
            transform: rotate(-25deg);
          }
          body {
            padding-top: 46px !important;
            padding-bottom: 28px !important;
          }
        }
      `}</style>
      <div className="pdf-header" style={{ display: "none" }}>
        <img src="/logo.png" alt="mcqpalagu.in" style={{ height: 26 }} />
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
