import RequestBuilder from '@/lib/hooks/builders/request-builder';

export interface Item {
  name: string;
  amount: number;
  currency: string;
  description: string;
}

// let socket = io('http://localhost:4001', {autoConnect: false});
// let roomId = '';

// socket.on('connect', () => {
//   console.log('Connected to server');
//   retrieveData(roomId);
// });

// socket.on('payment_message', (data) => {
//   console.log('Incoming message:', data);
//   socket.disconnect();
// }); 

// socket.on('disconnect', () => {
//   console.log('Disconnected from server');
// })


// const retrieveData = async (roomId: string): Promise<void> => {
//   if (socket.connected) {
//     console.log("Connecting to room...");
//     socket.emit("room", roomId);

//     // console.log("Requesting data...");
//     // socket.emit("request_data", roomId);
//   } else {
//     console.error("Socket not connected");
//   }
// }

// export const connectSocket = async (payment_intent_id: string): Promise<void> => {
//   socket.connect();
//   roomId = payment_intent_id;
//   // socket.disconnect();
// }

export const createCheckoutSession = async (item: Item): Promise<any> => {
  const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/transactions/purchase_tokens`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' })
    .setBody(JSON.stringify({
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      name: item.name,
      quantity: 1
    }));
  
  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseData: any = await response.json();
      // connectSocket(responseData.data.attributes.payment_intent.id)
      return responseData;
    } else {
      console.error('Failed to create checkout session: ' + response.statusText);
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
      console.error('Failed to expire session: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error expiring session:', error);
  }
};

export const getSession = async (checkoutSessionId: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Basic ${process.env.NEXT_PUBLIC_PM_API_KEY}`,
      },
    });

    if (response.ok) {
      const responseData: any= await response.json();
      return responseData;
    } else {
      throw new Error('Failed to get session: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error getting session:', error);
  }
};
