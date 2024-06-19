"use client";

import Sidenav from '@/components/ui/ui-composite/sidenav';
import Header from '@/components/ui/ui-composite/header'
import { WorkspaceMaterialProvider } from '../../lib/hooks/workspace-material-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceMaterialProvider>
      <div className="block h-screen bg-white dark:bg-zinc-900 w-full">
        <Header />
        <div className="flex h-full w-full">
          <Sidenav />
          <main className="flex-1 p-4 overflow-auto w-full">{children}</main>
        </div>
      </div>
    </WorkspaceMaterialProvider>
  );
}