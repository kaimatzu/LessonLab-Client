"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { CombinedProvider } from '@/lib/hooks/context-providers/user-context';
import { Provider } from 'react-redux';
import store from "@/redux/store";
import { Toaster } from "@/components/ui/ui-base/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>HyperText</title>
        <meta name="description" content="This is a simple multi-tenant RAG application built using Pinecone Serverless, the Vercel AI SDK and OpenAI. It uses namespaces to separate context between workspaces." />
      </head>
      <body className={`${inter.className} overflow-hidden`}>
        <Provider store={store}>
          <CombinedProvider>
            {children}
          </CombinedProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
