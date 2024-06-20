"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    
  return (
    <div className="block h-screen bg-white dark:bg-zinc-900 w-full">
        <main className="flex-1 p-4 overflow-auto w-full">{children}</main>
    </div>
  );
}