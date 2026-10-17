import { Suspense } from "react";
import { SimpleView } from "@/components/SimpleView";
import { Experience } from "@/scene/Experience";

export default function Home() {
  return (
    <>
      <Suspense>
        <Experience />
      </Suspense>
      {/* Plain HTML for crawlers and screen readers. Visually hidden while the desk is shown. */}
      <div className="sr-only"><SimpleView /></div>
    </>
  );
}
