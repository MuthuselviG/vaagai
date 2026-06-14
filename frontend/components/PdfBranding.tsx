"use client";

import { usePathname } from "next/navigation";

const WATERMARK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1131'%3E%3Cg transform='rotate(-25 400 565)' opacity='0.18'%3E%3Cimage href='https://mcqpalagu.in/logo.png' x='270' y='370' width='260' height='173'/%3E%3Ctext x='400' y='620' font-size='60' font-family='sans-serif' font-weight='800' fill='%2310204F' text-anchor='middle'%3Emcqpalagu.in%3C/text%3E%3C/g%3E%3C/svg%3E";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        @media print {
          body {
            position: relative;
          }
          .page-watermark {
            display: block;
            position: absolute;
            inset: 0;
            background-image: url("${WATERMARK_SVG}");
            background-repeat: repeat;
            background-size: 800px 1131px;
            pointer-events: none;
            z-index: 9999;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
      <div className="page-watermark" style={{ display: "none" }} />
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
