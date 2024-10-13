import React from 'react';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import { createCheckoutSession, Item as PaymongoItem } from '@/app/api/transaction/paymongo';
import { cn } from '@/lib/utils'; // Adjust the import path as necessary
import { useUserContext } from '@/lib/hooks/context-providers/user-context';

interface ItemProps {
  item: PaymongoItem;
  checkoutWindow: Window | undefined; 
  setCheckoutWindow: React.Dispatch<React.SetStateAction<Window | undefined>>;
}

export const Item: React.FC<ItemProps> = ({ item, checkoutWindow, setCheckoutWindow }) => {
  const { createTransaction } = useUserContext();
  
  const formattedAmount = (item.amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleBuyTokens = async () => {
    try {
      const response = await createCheckoutSession(item);
      if (response && response.data) {
        console.log(response.data)
        const newWindow = window.open(response.data.attributes.checkout_url, '_blank');

        //TODO: Find a way to terminate the connection on shop close or on transaction cancel
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
    <div className={cn("flex flex-col m-1 items-center p-4 rounded-md shadow-lg bg-[#5a5a5a]", "item")}>
      <Image src={icon} alt="Item Image" width={50} height={50} className="mb-4" />
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
        <button
          className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          onClick={handleBuyTokens}
          // onClick={testConnectSocket}
        >
          BUY {formattedAmount} {item.currency}
        </button>
      </div>
    </div>
  );
};
