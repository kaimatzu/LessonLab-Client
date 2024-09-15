"use client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center h-screen bg-gradient-to-tl from-[#5E77D3] to-[#193468] w-full">
      <main className="flex p-4 flex-col justify-center align-middle overflow-auto w-full">{children}</main>
    </div>
  );
}