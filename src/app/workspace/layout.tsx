"use client";

import Sidenav from '@/components/ui/ui-composite/sidenav';
import Header from '@/components/ui/ui-composite/header'
import { WorkspaceMaterialProvider } from '@/lib/hooks/context-providers/workspace-material-context';
import { Button } from '@/components/ui/ui-base/button';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceMaterialProvider>
      <div className="block h-screen bg-white dark:bg-zinc-900 w-full">
        <Header />
        {/* TODO: Figure out how to implement correct height of main elements if styling breaks for some reason, this is a temporary measure */}
        <div className="flex h-[calc(100%-72px)] w-full bg-[#f1f3f8]"> 
          <Sidenav />
          <main className="flex-1 overflow-auto w-full">
            {/*TODO: MAKE THIS A SEPARATE COMPONENT*/}
            <div className={`flex flex-col z-[200] border-b border-gray-300 select-none text-black w-full mx-0`}>
              <div className={`flex items-center align-middle p-2 rounded text-sm justify-between`}>
                  <div className="flex flex-row justify-start">
                    <div className="mr-2 ml-2">O</div>
                      <span>
                        {/* {workspace.name} */}some workspace name
                      </span>
                    <button className="ml-8">...</button>
                  </div>
                  <Button className="text-white text-sm h-8 bg-gradient-to-r from-secondary to-primary rounded-sm hover:opacity-65 focus:outline-none">AI Assist</Button>
              </div>
            </div>
            {children}
            </main>
        </div>
      </div>
    </WorkspaceMaterialProvider>
  );
}