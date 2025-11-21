import "./globals.css";
import React from "react";

export const metadata = {
  title: "ScribeAI",
  description: "AI-powered meeting transcription and summarization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <div className="max-w-5xl mx-auto py-8 px-4">{children}</div>
      </body>
    </html>
  );
}
