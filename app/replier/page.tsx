"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReplierProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/you");
  }, [router]);
  return null;
}
