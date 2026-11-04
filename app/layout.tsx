import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { appFont } from "./fonts";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  description: "مدیریت کاربران، نقش‌ها، کیف پول و تنظیمات",
};

const themeScript = `(function(){try{if(document.cookie.split("; ").some(function(item){return item.indexOf("admin_theme=")===0;}))return;if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const stored = (await cookies()).get("admin_theme")?.value;
  const theme = stored === "dark" || stored === "light" ? stored : null;

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${appFont.variable}${theme === "dark" ? " dark" : ""}`}
      style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <body className="min-h-screen text-ink antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeProvider initial={theme}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
