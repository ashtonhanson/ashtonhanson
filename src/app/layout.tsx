import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AmbientOrbs } from "@/components/AmbientOrbs";
import { ScrollRestore } from "@/components/ScrollRestore";
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
    "Branding, logos, and advertising by Ashton Hanson: illustration, Adobe Creative Suite, and AI-assisted visual storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} min-h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if("scrollRestoration"in history)history.scrollRestoration="manual"}catch(e){}`,
          }}
        />
      </head>
      <body className="w-full max-w-full bg-background font-display text-foreground antialiased">
        <div
          className="site-header-frost pointer-events-none fixed inset-x-0 top-0 z-[99] bg-[rgb(12_12_13/0.42)] backdrop-blur-[22px] backdrop-saturate-[1.7]"
          aria-hidden="true"
        />
        <ScrollRestore />
        <AmbientOrbs />
        <SiteHeader />
        <div className="site-header-slot" aria-hidden="true" />
        <div className="relative w-full max-w-full overflow-x-clip">
          <main className="w-full max-w-full overflow-x-clip">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
