'use client'

import {useEffect, useState } from "react";

const Page = () => {

  const [count, setCount] = useState(0);

  useEffect(() => {
    const close = () => {
      window.close();
    }

    setTimeout(() => {
      close();
    }, 5000);
  }, []);

  return <div className="h-screen flex justify-center items-center bg-blue-50 font-20">Transaction Cancelled.</div>;
};

export default Page;
