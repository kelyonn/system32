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

// Phones held sideways get a laptop-sized layout that the browser scales down, so the desk
// looks and behaves like it does on a laptop. Portrait keeps the compact phone layout, and
// /simple stays a normal responsive page.
const phoneViewport = `(function(){try{
if(/\/simple\/?$/.test(location.pathname))return;
var m=document.querySelector('meta[name=viewport]');
if(!m){m=document.createElement('meta');m.name='viewport';document.head.appendChild(m);}
var land=matchMedia('(orientation: landscape)');
function set(){
var phone=matchMedia('(pointer: coarse)').matches&&Math.min(screen.width,screen.height)<700;
m.content=phone&&land.matches?'width=1100':'width=device-width, initial-scale=1';
}
set();
if(land.addEventListener)land.addEventListener('change',set);
addEventListener('orientationchange',set);
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: phoneViewport }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
