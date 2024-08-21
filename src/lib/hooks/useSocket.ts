import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

const socket = io('http://localhost:4001', { autoConnect: false });

export const useSocket = () => {
  // const [socket, setSocket] = useState<Socket>(io('http://localhost:4001', { autoConnect: false }));
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [transactionRoomId, setTransactionRoomId] = useState<string>('');
  const [transactionData, setTransactionData] = useState({ status: '', id: '' });

  useEffect(() => {
    console.log("Initializing server socket connections...");

    socket.on('connect', () => {
      console.log('Connected to server');
      setSocketConnected(true);
    });
      
    socket.on('payment_message', (data) => {
      console.log('Incoming message:', data);
      setTransactionData({ status: data.payment_status, id: data.payment_intent_id });
      socket.disconnect();
      setSocketConnected(false);
    });
      
    socket.on('content', (content) => {
      console.log("content chunk:", content);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('payment_message');
      socket.off('disconnect');
    };
  }, [socket]);

  const connectSocket = () => {
    socket.connect();
  };

  const disconnectSocket = () => {
    socket.disconnect();
  }

  const joinTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socket.connected) {
      console.log("Connecting to room:", payment_intent_id);
      socket.emit("join-room", payment_intent_id);
    } else {
      console.error("Socket not connected");
    }
  };

  const leaveTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socket.connected) {
      console.log("Leaving room:", payment_intent_id);
      socket.emit("leave-room", payment_intent_id);
    } else {
      console.error("Socket not connected");
    }
  }

  const joinWorkspaceRoom = (workspace_id: string) => {
    console.log(workspace_id);

    if (socket.connected) {
      console.log("Connecting to room:", workspace_id);
      socket.emit("join-room", workspace_id);
    } else {
      console.error("Socket not connected");
    }
  }

  const leaveWorkspaceRooms = () => {
    if (socket.connected) {
      console.log("Leaving all workspace rooms...");
      socket.emit("leave-all-rooms");
    } else {
      console.error("Socket not connected");
    }
  } 

  const sendMessageToAssistant = (message: string) => {
    socket.emit('new-message', message);
  }

  // useEffect(() => {
  //   const retrieveData = async (roomId: string): Promise<void> => {
  //     console.log("Transaction room id:", transactionRoomId);


  //   if (transactionRoomId !== '' && socketConnected) {
  //     console.log("Socket status:", socket.connected);
  //     retrieveData(transactionRoomId);
  //   }
  // }, [transactionRoomId, socketConnected]);

  return {
    socket,
    connectSocket,
    transactionData,
    setTransactionData,
    createTransaction: joinTransactionRoom,
    cancelTransaction: leaveTransactionRoom,
    joinWorkspaceRoom,
    leaveWorkspaceRooms,
    sendMessageToAssistant,
    socketConnected,
  };
};
