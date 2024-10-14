'use client'

import React, { useState, useEffect } from 'react';
import LoginPage from '../auth/(auth_layouts)/(login)/Login';
import RegisterPage from '../auth/(auth_layouts)/(register)/Register';
import Link from 'next/link';
import HypertextLogoWhite from '@/assets/hypertext-logo-white';
// import Image from 'next/image';
// import OrderLightImage from '../assets/Order_light.png';
// import HypertextLogo from '../src/assets/HypertextLogo';


const LandingLayout: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    document.body.classList.add('no-scroll', 'no-scrollbar')
    console.log(document.body.classList)

    return () => {
      document.body.classList.remove('no-scroll', 'no-scrollbar')
      console.log(document.body.classList)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % textItems.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // #region Texts
  const textItems = [
    {
      title: 'Empower Your Workflow',
      subtitle: 'Streamline Your Success and Unlock Your Full Potential Every Day',
    },
    {
      title: 'Your Ideas, Our Platform',
      subtitle: 'Unleash Your Creativity and Bring Your Vision to Life with Ease',
    },
    {
      title: 'Simplify Your Tasks',
      subtitle: 'Achieve More, Stress Less, and Enjoy Every Moment of Your Journey',
    },
    {
      title: 'Innovate with Ease',
      subtitle: 'Make Your Mark on the World and Change the Way You Work Forever',
    },
    {
      title: 'Navigate Your Projects',
      subtitle: 'Master Your Goals and Discover New Possibilities Along the Way',
    },
    {
      title: 'Work Smarter, Not Harder',
      subtitle: 'Efficiency at Your Fingertips, Helping You Focus on What Truly Matters',
    },
  ]

  // #region Header
  return (
    <div className="flex flex-col justify-center h-screen bg-gradient-to-r from-[#5E77D3] to-[#051A41] w-full">
      <nav className="flex justify-between items-center py-4 px-20 bg-black bg-opacity-20 shadow-lg w-full">
        <div className="flex">
          <HypertextLogoWhite width={36} height={36}/>
          <div className="text-white text-2xl font-light ml-4">
            HyperText
          </div>
        </div>
        <div>
          
        <div className="flex justify-start items-center space-x-20">
          <Link href={'/auth?mode=login'}>
            <button
              className="mr-4 text-white hover:text-blue-300 transition duration-300"
              // onClick={goToLogin}
            >
              Login
            </button>
          </Link>
          <Link href={'/auth?mode=signup'}>
            <button
              className="bg-gradient-to-r from-[#9AADEC] to-[#5E77D3] text-white px-6 py-2 rounded-md hover:bg-blue-700 hover:opacity-65 transition duration-300"
              // onClick={goToSignUp}
            >
              Sign Up
            </button>
          </Link>
        </div>
        </div>
      </nav>

      {/* 
        // #region Order Light
       */}
      {/* <Image 
        src={'/assets/Order_light.png'}
        alt="Order Illustration"
        width={500} 
        height={600} 
        className="fixed h-auto right-10 bottom-1/4 z-[0] hidden md:block" 
      /> */}

            {/* 
            // #region Main
             */}
      <main className="flex-grow flex flex-col justify-center items-start px-16 md:px-0 lg:px-24 text-white">
  <div className="w-full h-auto mb-4">
    <svg
      width="50%"
      height="100%"
      viewBox="0 0 500 60"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
    >
      <path id={`path${currentIndex}`}>
        <animate
          attributeName="d"
          from="m0,110 h0"
          to="m0,110 h1100"
          dur="8s"
          begin="0s;"
          repeatCount="indefinite" 
          id="pathAnim"
        />
        <animate
          attributeName="opacity"
          values="1;1;0"
          dur="8s" 
          begin="0s;" 
          repeatCount="indefinite" 
        />
      </path>
      <text
        fontSize="35"
        fontWeight="bold"
        fill="hsla(0, 0%, 100%, 1)"
        dy="-80"
        className='font-sans'
      >
        <textPath xlinkHref={`#path${currentIndex}`}>
          {textItems[currentIndex].title}
        </textPath>
      </text>
    </svg>
    <div className="relative">
  <p className="absolute top-0 left-0 text-lg md:text-xl mb-00 text-left mt-0">
    {textItems[currentIndex].subtitle.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ))}
  </p>
</div>

{/* <Image 
  src={OrderLightImage}
  alt="Order Illustration"
  width={800} 
  height={600} 
  className="w-full h-auto mb-4 ml-auto" 
/> */}

  </div>
  <Link href='/auth'>
    <button className="bg-gradient-to-r from-[#9AADEC] to-[#5E77D3] text-white px-12 py-3 text-lg rounded-md hover:bg-blue-700 mt-8 hover:opacity-65 transition duration-300">
      Get Started
    </button>
  </Link>

</main>

    </div>
  )
}
export default LandingLayout
