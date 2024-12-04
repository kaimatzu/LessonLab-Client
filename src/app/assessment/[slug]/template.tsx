'use client'

import { usePathname } from "next/navigation";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const match = pathname.match(/^\/[^/]+\/([^/]+)/)
  const moduleIdSlug = match ? match[1] : null

  return (
    <div className="bg-">
    <header className="border-b p-8">
      Assessment ID: {moduleIdSlug} 
    </header>
    {children}
    </div>
  );
};
