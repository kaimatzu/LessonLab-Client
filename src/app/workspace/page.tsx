import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='flex flex-col items-center justify-center h-full rounded-2xl bg-cover text-black dark:bg-zinc-900 dark:text-zinc-100'>
      {/* <div className="backdrop-blur-sm bg-white/30 dark:bg-zinc-800 border-dotted rounded-lg border-2 border-gray-300 dark:border-zinc-600 p-1 sm:p-5 md:p-12 md:max-w-[90%]"> */}
      <div className="backdrop-blur-sm bg-transparent dark:bg-zinc-800 dark:border-zinc-600 p-1 sm:p-5 md:p-12 md:max-w-[90%]">
        <h4 className="text-2xl mb-5 text-center text-[#BFBFBF]">Select a workspace<br/>to get started</h4>
        {/* <p className="text-xs md:text-base text-gray-700 dark:text-zinc-300 text-pretty">
          A simple multi-tenant RAG application built using <span className=''>Pinecone Serverless</span>, the <span className=''>Vercel AI SDK</span> and <span className=''>Open AI</span>.
          It uses <a href='https://docs.pinecone.io/guides/operations/understanding-multitenancy#namespaces'
            className='underline hover:opacity-65'
            target='_blank'> namespaces</a> to <span className='font-medium'>separate context between workspaces (tenants)</span>.
        </p> */}
        {/* <div className='flex flex-row gap-5 items-center'> */}
          {/* <Link href='/workspace/default' className="text-xs bg-primary p-2 px-4 rounded-md md:text-base text-black hover:opacity-65 focus:outline-none flex items-center justify-center mt-10">
            Chat with workspace
          </Link> */}
          <Link href='/workspace/new'>
            <div className="text-xs bg-gradient-to-r from-secondary to-primary p-2 px-4 rounded-md md:text-base text-white hover:opacity-65 focus:outline-none flex items-center justify-center mt-10">
            {/* <div className="text-xs md:text-base text-[#f1c41b] hover:opacity-65 focus:outline-none flex items-center justify-center mt-10"> */}
              Create new
            </div>
          </Link>
        {/* </div> */}
      </div>
    </div>
  );
};
