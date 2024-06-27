import Link from 'next/link'

import { Button } from '@/components/ui/ui-base/button'

export default function NotFound() {

  const title = `
    tracking-tight inline font-semibold
    text-4xl lg:text-6xl text-zinc-50
  `
  // text-[2.3rem] lg:text-5xl leading-9

  return (
    <div className='bg-[#2D2B2C] h-screen flex justify-center align-center text-center'>
      <div className='self-center flex flex-col gap-12'>
        <h1 className={title}>Not Found</h1>
        <p>Could not find requested resource</p>
        <Link href="/workspace"><Button>Return Home</Button></Link>
      </div>
    </div>
  )
}