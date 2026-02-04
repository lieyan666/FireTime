"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToday } from "@/lib/dates";

export default function TodayPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/day/${getToday()}`);
  }, [router]);

  return null;
}

