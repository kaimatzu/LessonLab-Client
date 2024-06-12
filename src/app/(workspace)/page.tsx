import React from 'react';
import Link from 'next/link';

const Page = () => {
  return (
    <div className='flex flex-col items-center justify-center h-full rounded-2xl bg-cover text-black dark:bg-zinc-900 dark:text-zinc-100'>
      <div className="backdrop-blur-sm bg-white/30 dark:bg-zinc-800 border-dotted rounded-lg border-2 border-gray-300 dark:border-zinc-600 p-1 sm:p-5 md:p-12 md:max-w-[90%]">
        <h1 className="text-sm sm:text-xl md:text-4xl font-medium sm:font-normal mb-10">Welcome to LessonLab!</h1>
        <p className="text-xs md:text-base text-gray-700 dark:text-zinc-300 text-pretty">
          A simple multi-tenant RAG application built using <span className=''>Pinecone Serverless</span>, the <span className=''>Vercel AI SDK</span> and <span className=''>Open AI</span>.
          It uses <a href='https://docs.pinecone.io/guides/operations/understanding-multitenancy#namespaces'
            className='underline hover:opacity-65'
            target='_blank'> namespaces</a> to <span className='font-medium'>separate context between workspaces (tenants)</span>.
        </p>
        <div className='flex flex-row gap-5 items-center'>
          <Link href='/workspace/default' className="text-xs bg-[#1C17FF] dark:bg-zinc-100 p-2 px-4 rounded-md md:text-base text-white dark:text-zinc-950 hover:opacity-65 focus:outline-none flex items-center justify-center mt-10">
            Chat with workspace
          </Link>
          <Link href='/workspace/new'>
            <div className="text-xs md:text-base text-[#1C17FF] dark:text-zinc-100 hover:opacity-65 focus:outline-none flex items-center justify-center mt-10">
              Create your own
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
