"use client";

import Sidenav from '@/components/ui/ui-composite/sidenav';
import Header from '@/components/ui/ui-composite/header'
import { WorkspaceProvider } from '@/lib/hooks/context-providers/workspace-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="block h-screen bg-[#F1F3F8] dark:bg-zinc-900 w-full">
        <Header />
        {/* TODO: Figure out how to implement correct height of main elements if styling breaks for some reason, this is a temporary measure */}
        <div className="flex h-[calc(100%-41px)] w-full">
          <Sidenav />
          <main className="flex-1 w-full bg-[#F1F3F8] overflow-auto">{children}</main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}