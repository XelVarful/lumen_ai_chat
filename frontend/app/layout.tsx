import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Люмен — AI-чат",
  description: "Минималистичный AI-ассистент на Groq",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
