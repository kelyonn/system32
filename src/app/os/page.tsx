"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OS } from "@/os/OS";

function Inner() {
  const router = useRouter();
  const mode = useSearchParams().get("mode") === "terminal" ? "terminal" : "desktop";
  return <OS key={mode} initialMode={mode} onShutdown={() => router.push("/")} />;
}

export default function OSPage() {
  return <Suspense><Inner /></Suspense>;
}
