import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='flex flex-col items-center justify-start mt-20 h-full rounded-2xl bg-cover text-black dark:bg-zinc-900 dark:text-zinc-100'>
      <div className="backdrop-blur-sm bg-transparent dark:bg-zinc-800 dark:border-zinc-600 p-1 sm:p-5 md:p-12 md:max-w-[90%]">
        <h4 className="text-2xl text-center text-[#BFBFBF]">Select a workspace<br/>to get started</h4>
          <Link href='/workspace/new'>
            <div className="text-xs bg-gradient-to-r from-secondary to-primary p-1 px-4 rounded-lg md:text-base text-white hover:opacity-65 focus:outline-none flex items-center justify-start mt-10">
              <h1 className="text-2xl p-1 mr-8">+</h1>
              Create new
            </div>
          </Link>
      </div>
    </div>
  );
};