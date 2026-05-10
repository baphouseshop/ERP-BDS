import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AiChat } from "@/components/ai/ai-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP BĐS - Quản trị Bất Động Sản",
  description: "Hệ thống ERP chuyên dụng cho sàn môi giới BĐS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-row bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
        <AiChat />
      </body>
    </html>
  );
}
