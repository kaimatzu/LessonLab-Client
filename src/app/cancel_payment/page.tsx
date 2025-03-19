'use client'

import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const close = () => {
      window.close();
    }

    setTimeout(() => {
      close();
    }, 1000);
  }, []);

  return <div className="h-screen flex justify-center items-center bg-blue-100 font-20">Transaction Cancelled.</div>;
};

export default Page;
