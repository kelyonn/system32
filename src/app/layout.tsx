import type { Metadata } from "next";
import { fontVars } from "./fonts";
import { site } from "@/data/site";
import "./globals.css";

const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kelyonn.github.io";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = `${origin}${base}/`;
const title = `${site.person.name} | Tech and product`;
const description = `${site.person.tagline} ${site.person.status} Explore the desk.`;

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title,
  description,
  openGraph: { title, description, url, siteName: site.osName, type: "website", images: [{ url: `${base}/og.jpg`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: [`${base}/og.jpg`] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
