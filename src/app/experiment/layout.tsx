import type { Metadata } from "next";
import { ExperimentShell } from "./ExperimentShell";
import "./experiment.css";

export const metadata: Metadata = {
  title: "Logo study",
  description: "Bright landing study based on the new AH mark.",
  robots: { index: false, follow: false },
};

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExperimentShell>{children}</ExperimentShell>;
}
