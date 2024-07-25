"use client"

import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'white' }}>
      {transactionStatus !== 'payment.paid' ? (
        <>
          <CircularProgress style={{ color: 'yellow' }} />
          <Typography>Processing Transaction...</Typography>
        </>
      ) : (
        <>
          <CheckCircleIcon style={{ color: 'green', fontSize: 40 }} />
          <Typography>Transaction Finished. Closing Window.</Typography>
        </>
      )}
    </Box>
  );
};

export default TransactionResult;
