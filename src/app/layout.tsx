import type { Metadata } from "next";
import { fontVars } from "./fonts";
import { site } from "@/data/site";
import "./globals.css";

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kelyonn.github.io/system32";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const title = `${site.person.name} | Backend and systems engineer`;
const description = `${site.person.name}, ${site.person.role}. Container runtimes, GitOps tooling and small tools for real problems. Explore the desk.`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  openGraph: { title, description, url, siteName: site.osName, type: "website", images: [{ url: `${base}/og.png`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: [`${base}/og.png`] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
