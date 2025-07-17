import type { Metadata } from "next";
import HelpSection from "./HelpSection";

export const metadata: Metadata = {
  title: "Help & Support",
};

export default function Page() {
  return <HelpSection />;
}
