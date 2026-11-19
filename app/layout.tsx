import type { Metadata } from "next";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Doomsday Ready",
  description:
    "Plan your MCU rewatch and find seat bundles for your watch party.",
  icons: { icon: "/marathon-icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <main id="main" className="shell">
          {children}
        </main>
      </body>
    </html>
  );
}
