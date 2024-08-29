export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center h-screen bg-gradient-to-r from-violet-600 to-indigo-600 w-full">
      <main className="flex p-4 flex-col justify-center align-middle overflow-visible w-full">{children}</main>
    </div>
  );
}