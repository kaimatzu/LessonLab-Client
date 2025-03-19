import React from 'react';
import { createCheckoutSession, Item as PaymongoItem } from '@/app/api/transaction/paymongo';
import { cn } from '@/lib/utils'; // Adjust the import path as necessary
import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import { MdGeneratingTokens } from 'react-icons/md';
import { Button } from '../../ui-base/button';
import { FaDollarSign, FaPesoSign } from 'react-icons/fa6';

interface ItemProps {
  item: PaymongoItem;
  checkoutWindow: Window | undefined; 
  setCheckoutWindow: React.Dispatch<React.SetStateAction<Window | undefined>>;
}

export const StoreItem: React.FC<ItemProps> = ({ item, checkoutWindow, setCheckoutWindow }) => {
  const { createTransaction } = useUserContext();
  
  const formattedAmount = (item.amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleBuyTokens = async () => {
    try {
      const response = await createCheckoutSession(item);
      if (response && response.data) {
        console.log('>>> createCheckoutSession response: ', response.data)
        const newWindow = window.open(response.data.attributes.checkout_url, '_blank');

        // TODO: Find a way to terminate the connection on shop close or on transaction cancel
        // connectSocket(response.data.attributes.payment_intent.id);
        createTransaction(response.data.attributes.payment_intent.id);
        if (newWindow) {
          console.log("Opened new window:", response.data.attributes.checkout_url)
          setCheckoutWindow(newWindow);
        }
      } else {
        console.error("Invalid response data:", response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex flex-col m-1 items-center p-4 rounded-md shadow-sm bg-blue-50 text-zinc-950 border border-border", "item")}>
      <div className="flex flex-col items-center">
        <div className='flex flex-row items-center'>
          <MdGeneratingTokens className='translate-y-[-5px] w-5 h-5 fill-blue-600'/> &nbsp; <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
        </div>
        <Button
          className="px-4 py-2 bg-blue-300 text-white rounded hover:bg-blue-100"
          onClick={handleBuyTokens}
        >
          {item.currency === 'PHP' ? <FaPesoSign /> : <FaDollarSign />} {formattedAmount}
        </Button>
      </div>
    </div>
  );
};
