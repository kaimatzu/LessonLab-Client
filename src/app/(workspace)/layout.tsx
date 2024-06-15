"use client";

import Sidenav from '@/components/ui/ui-composite/sidenav';
import { WorkspaceChatProvider } from '../../lib/hooks/workspace-chat-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceChatProvider>
      <div className="flex h-screen bg-white dark:bg-zinc-900 w-full">
        <Sidenav />
        <main className="flex-1 p-4 overflow-auto w-full">{children}</main>
      </div>
    </WorkspaceChatProvider>
  );
}