import { useState, useEffect } from 'react';

export const useBroadcastChannel = (channelName: string) => {
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [isTransactionFinished, setIsTransactionFinished] = useState<boolean>(false);

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    setBroadcastChannel(channel);

    channel.onmessage = (event) => {
      console.log('Receiving message:', event.data);
      
      // This is used by the transaction complete window
      if (event.data.status) {
        console.log("Transaction status:", event.data.status);
        setTransactionStatus(event.data.status);
        setIsTransactionFinished(true); // Set to true so the transaction result window can close if this value is changed. 
      }
    };

    return () => {
      channel.close();
    };
  }, [channelName]);

  return {
    broadcastChannel,
    transactionStatus,
    isTransactionFinished,
    setTransactionStatus,
    setIsTransactionFinished,
  };
};
