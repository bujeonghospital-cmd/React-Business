import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Data - TPP",
};

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <style>{`
          body { margin: 0 !important; padding: 0 !important; }
          header, .header, nav, .nav { display: none !important; }
          footer, .footer { display: none !important; }
          .layout-grid { display: block !important; }
          main { padding: 0 !important; margin: 0 !important; }
        `}</style>
      </head>
      <body className="m-0 p-0 w-full h-full overflow-x-auto">{children}</body>
    </html>
  );
}
