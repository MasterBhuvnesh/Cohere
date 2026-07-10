"use client";

import { Quantum } from "ldrs/react";
import "ldrs/react/Quantum.css";

export default function MarketingLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center">
      <Quantum size="45" speed="1.75" color="var(--primary)" />
    </div>
  );
}
