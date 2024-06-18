import React from 'react';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import { createCheckoutSession, Item as PaymongoItem } from '@/app/api/transaction/paymongo';
import { cn } from '@/lib/utils'; // Adjust the import path as necessary

interface ItemProps {
  item: PaymongoItem;
}

export const Item: React.FC<ItemProps> = ({ item }) => {
  const formattedAmount = (item.amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleBuyTokens = async () => {
    try {
      const response = await createCheckoutSession(item);
      if (response && response.data) {
        console.log(response.data.data);
        window.open(response.data.data.attributes.checkout_url, '_blank');
      } else {
        console.error("Invalid response data:", response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={cn("flex flex-col items-center p-4 border border-gray-300 rounded-md shadow-lg bg-white")}>
      <Image src={icon} alt="Item Image" width={50} height={50} className="mb-4" />
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleBuyTokens}
        >
          BUY {formattedAmount} {item.currency}
        </button>
      </div>
    </div>
  );
};
