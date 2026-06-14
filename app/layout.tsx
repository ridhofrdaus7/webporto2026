import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
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
    <html lang="en">
      <body className={plusJakarta.variable}>{children}</body>
    </html>
  );
}
