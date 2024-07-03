"use client";

import Sidenav from '@/components/ui/ui-composite/sidenav';
import Header from '@/components/ui/ui-composite/header'
import { WorkspaceMaterialProvider } from '@/lib/hooks/context-providers/workspace-material-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceMaterialProvider>
      <div className="block h-screen bg-white dark:bg-zinc-900 w-full">
        <Header />
        {/* TODO: Figure out how to implement correct height of main elements if styling breaks for some reason, this is a temporary measure */}
        <div className="flex h-[calc(100%-72px)] w-full"> 
          <Sidenav />
          <main className="flex-1 pr-4 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </WorkspaceMaterialProvider>
  );
}