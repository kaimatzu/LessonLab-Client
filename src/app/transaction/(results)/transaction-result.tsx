"use client"

import { useState, useEffect } from 'react';
import RequestBuilder from '@/lib/hooks/builders/request-builder';

const TransactionResult = () => {
  const [paymentStatus, setpaymentStatus] = useState<string | null>('');
  
  useEffect(() => {
    const sessionId = localStorage.getItem('checkout_session_id');

    if (!sessionId) {
      console.error('No session ID found.')
      return
    }

    console.log('Retrieved session ID:', sessionId)
    console.log('>>> %cAdding tokens to user:', 'color:orange', )

    const userId = localStorage.getItem('user-id');

    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/checkout_status/${sessionId}?user_id=${userId}`)
      .setMethod("GET")
      .setCredentials("include")
      .setHeaders({
        "Content-Type": "application/json",
      });

    fetch(requestBuilder.build())
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json()
      })
      .then(data => {
        const status = data?.data?.attributes?.payments?.[0]?.status;
        setpaymentStatus(status)
        // Clear session ID if payment is successful // New checkout overwrites the session ID
        if (data.message === "Tokens added successfully") {
          console.log('Payment successful! Tokens added.')
          localStorage.removeItem('checkout_session_id');
          window.close();
        }
      })
      .catch(err => console.error('Error fetching payment status:', err))

  }, []);

  return (
    <div>
      <h1>Transaction Result</h1>
      {paymentStatus ? (
        <p>Payment Status: {paymentStatus}</p>
      ) : (
        <p>Checking payment status...</p>
      )}
    </div>
  )

};
export default TransactionResult;