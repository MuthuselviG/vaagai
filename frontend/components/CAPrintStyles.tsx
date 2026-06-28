export default function CAPrintStyles({ variant }: { variant: "hub" | "unit" }) {
  if (variant === "hub") {
    return (
      <style>{`
        .pdf-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .pdf-only { display: block !important; }
          body { background: white; }
        }
      `}</style>
    );
  }

  return (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        body { background: white; }
      }
    `}</style>
  );
}
