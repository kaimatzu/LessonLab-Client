export interface Item {
  name: string;
  amount: number;
  currency: string;
  description: string;
}

interface CheckoutSessionResponse {
  data: {
    data: {
      id: string;
      attributes: {
        checkout_url: string;
      };
    };
  };
}

const generateReferenceNumber = (): string => {
  const timestamp = Date.now();
  return timestamp.toString();
};

export const createCheckoutSession = async (item: Item): Promise<CheckoutSessionResponse> => {
  try {
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Basic ${process.env.NEXT_PUBLIC_PM_API_KEY}`, // encoded key
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                amount: item.amount,
                currency: item.currency,
                description: item.description,
                name: item.name,
                quantity: 1,
              },
            ],
            payment_method_types: ['gcash'],
            reference_number: generateReferenceNumber(),
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            success_url: 'http://localhost:3000/',
            cancel_url: 'http://localhost:3000/cancel_payment',
            description: 'checkout description',
          },
        },
      }),
    });

    if (response.ok) {
      const responseData: CheckoutSessionResponse = await response.json();
      return responseData;
    } else {
      throw new Error('Failed to create checkout session: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const expireSession = async (checkoutSessionId: string): Promise<void> => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Basic ${process.env.NEXT_PUBLIC_PM_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to expire session: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error expiring session:', error);
    throw error;
  }
};

export const getSession = async (checkoutSessionId: string): Promise<CheckoutSessionResponse> => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Basic ${process.env.NEXT_PUBLIC_PM_API_KEY}`,
      },
    });

    if (response.ok) {
      const responseData: CheckoutSessionResponse = await response.json();
      return responseData;
    } else {
      throw new Error('Failed to get session: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
};
