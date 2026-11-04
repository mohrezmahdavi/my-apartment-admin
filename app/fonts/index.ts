import localFont from "next/font/local";

export const appFont = localFont({
  src: [
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Thin.woff2", weight: "100", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-UltraLight.woff2", weight: "200", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Light.woff2", weight: "300", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Regular.woff2", weight: "400", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Medium.woff2", weight: "500", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-DemiBold.woff2", weight: "600", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Bold.woff2", weight: "700", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./iranyekan/Woff2/IRANYekanXFaNum-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-app",
  display: "swap",
  fallback: ["Tahoma", "sans-serif"],
});
