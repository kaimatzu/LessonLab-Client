"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center h-screen bg-zinc-50 dark:bg-zinc-950 w-full">
      <main className="flex p-4 flex-col justify-center align-middle overflow-auto w-full">{children}</main>
    </div>
  );
}