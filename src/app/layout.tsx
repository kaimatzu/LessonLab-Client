"use client"

// import { metadata } from './metadata';
import { Inter } from "next/font/google";
import "./globals.css";
import { CombinedProvider } from '@/lib/hooks/context-providers/user-context';
import { useRouteContext } from '@/lib/hooks/context-providers/route-context';
import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import { useEffect, useSyncExternalStore } from 'react';

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "LessonLab",
//   description: "This is a simple multi-tenant RAG application built using Pinecone Serverless, the Vercel AI SDK and OpenAI. It uses namespaces to separate context between workspaces.",
// };

// Use the `dark` modifier for dark mode example: `dark:bg-zinc-900`
// Dark mode color palette (colors from tailwind )
// zinc-50  | -> background-color: rgb(250, 250, 250); 
// zinc-100 | -> background-color: rgb(244, 244, 245);
// zinc-200 | -> background-color: rgb(228, 228, 231);
// zinc-300 | -> background-color: rgb(212, 212, 216);
// zinc-400 | -> background-color: rgb(161, 161, 170);
// zinc-500 | -> background-color: rgb(113, 113, 122);
// zinc-600 | -> background-color: rgb(82, 82, 91);   
// zinc-700 | -> background-color: rgb(63, 63, 70);   
// zinc-800 | -> background-color: rgb(39, 39, 42);   
// zinc-900 | -> background-color: rgb(24, 24, 27);   
// zinc-950 | -> background-color: rgb(9, 9, 11);    

// TODO: Change logo
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>LessonLab</title>
        <meta name="description" content="This is a simple multi-tenant RAG application built using Pinecone Serverless, the Vercel AI SDK and OpenAI. It uses namespaces to separate context between workspaces." />
      </head>
      <body className={inter.className}>
        <CombinedProvider>
          <AuthenticatedContent>{children}</AuthenticatedContent>
        </CombinedProvider>
      </body>
    </html>
  );
}

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { user } = useUserContext();
  const { push } = useRouteContext();

  useEffect(() => {
    if (!user) {
      push('/auth');
    }
  }, [user, push]);

  return <>{children}</>;
}