import type { Metadata } from "next";
import "./globals.css";
import { appFont } from "./fonts";
import { AuthProvider } from "./_lib/auth";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  description: "مدیریت کاربران، نقش‌ها، کیف پول و تنظیمات",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={appFont.variable}>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
