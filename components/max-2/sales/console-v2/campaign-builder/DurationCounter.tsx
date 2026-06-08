"use client";

import { useState, useEffect } from "react";

export default function DurationCounter() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 rounded-full bg-[#fef3c7] px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
      <span className="text-[10px] font-semibold text-[#92400e] tabular-nums">{formatted}</span>
    </div>
  );
}
