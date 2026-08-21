import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AmbientOrbs } from "@/components/AmbientOrbs";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

/* Display + body share Montserrat (menu typeface) */
const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Ashton Hanson Design | Branding and Identity",
    template: "%s | Ashton Hanson Design",
  },
  description:
    "Branding, logos, and advertising by Ashton Hanson—illustration, Adobe Creative Suite, and AI-assisted visual storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} min-h-full`}>
      <body className="relative w-full max-w-full bg-background font-display text-foreground antialiased">
        <AmbientOrbs />
        <div className="relative z-10 w-full max-w-full">
          <SiteHeader />
          <main className="w-full max-w-full">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
