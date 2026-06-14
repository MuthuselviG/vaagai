"use client";

import { usePathname } from "next/navigation";

const WATERMARK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Ctext x='160' y='170' font-size='30' font-family='sans-serif' font-weight='800' fill='%2310204F' fill-opacity='0.08' text-anchor='middle' transform='rotate(-30 160 160)'%3Emcqpalagu.in%3C/text%3E%3C/svg%3E";

export default function PdfBranding() {
  const pathname = usePathname();
  const url = `mcqpalagu.in${pathname}`;

  return (
    <>
      <style>{`
        @media print {
          html, body {
            background-image: url("${WATERMARK_SVG}");
            background-repeat: repeat;
            background-size: 320px 320px;
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
