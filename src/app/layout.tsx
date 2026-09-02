import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ScrollRestore } from "@/components/ScrollRestore";
import { ExperimentShell } from "@/app/experiment/ExperimentShell";
import "./globals.css";
import "./experiment/experiment.css";

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
    <html lang="en" className={`${display.variable} is-logo-study min-h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if("scrollRestoration"in history)history.scrollRestoration="manual"}catch(e){}`,
          }}
        />
      </head>
      <body className="w-full max-w-full bg-background font-display text-foreground antialiased">
        <ScrollRestore />
        <ExperimentShell>
          <div className="relative w-full max-w-full overflow-x-clip">
            <main className="w-full max-w-full overflow-x-clip">{children}</main>
          </div>
        </ExperimentShell>
      </body>
    </html>
  );
}
