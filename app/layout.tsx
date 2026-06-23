import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/admin/toast";
import { ToastFromParams } from "@/components/admin/toast-params";
import { AnalyticsBeacon } from "@/components/public/analytics-beacon";
import { ScrollProgress } from "@/components/scroll/scroll-progress";

// Runs before paint to set the theme from storage / OS preference,
// avoiding a flash of the wrong theme on first load.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif"
});

export const metadata: Metadata = {
  title: {
    default: "Ridho Firdaus - Creative Portfolio",
    template: "%s | Ridho Firdaus"
  },
  description:
    "Graphic design, video editing, and digital campaign visuals crafted for brands.",
  openGraph: {
    title: "Ridho Firdaus - Creative Portfolio",
    description:
      "Editorial portfolio for graphic design, video editing, and campaign visuals.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${instrumentSerif.variable}`}>
        {/* Sets the theme from storage/OS before paint (no flash). `beforeInteractive`
            is injected into the head and runs ahead of hydration — and avoids React
            19's "script inside a component" warning from a raw <script> tag. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ScrollProgress />
        <AnalyticsBeacon />
        <ToastProvider>
          {children}
          <Suspense>
            <ToastFromParams />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
