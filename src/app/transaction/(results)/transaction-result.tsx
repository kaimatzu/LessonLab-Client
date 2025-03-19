"use client"

import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import React, { useEffect } from 'react';
import Spinner from '@/components/ui/ui-base/spinner';
import { LuCheckCircle2 } from 'react-icons/lu';

const TransactionResult = () => {
  const { isTransactionFinished, broadcastChannel, transactionStatus } = useUserContext();
  
  useEffect(() => {
    // Placeholder for API call to validate transaction...
    console.log("Transaction status changed:", isTransactionFinished);

    broadcastChannel?.postMessage({ transaction_window_ready: true });

    if (isTransactionFinished) {
      console.log("Transaction finished");
      
      setTimeout(() => {
        window.close(); // Close the tab or navigate away
      }, 5000); // Auto-close after 5 seconds
    }
  }, [isTransactionFinished]);

  // console.log('>>> %ctransactionStatus: ', 'color: #bada55', transactionStatus);
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-blue-100'>
      {transactionStatus !== 'payment.paid' ? (
        <>
          <Spinner />
          <p className='mt-10'>Processing Transaction...</p>
        </>
      ) : (
        <>
          <LuCheckCircle2 className='text-green-800 h-10 w-10'/>
          <p className='mt-10'>Transaction Finished. Closing Window.</p>
        </>
      )}
    </div>
  );
};

export default TransactionResult;
