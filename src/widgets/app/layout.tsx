'use client';

import "./globals.css";
import { WidgetLayout } from '@nitrostack/widgets';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, sans-serif",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <WidgetLayout>
          {children}
        </WidgetLayout>
      </body>
    </html>
  );
}
