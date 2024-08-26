import { useState } from 'react';
import io, { Socket } from 'socket.io-client';

import { updateChatLoadingStatus, addChatHistory, updateChatMessage } from '@/redux/slices/workspaceSlice';

import store, { RootState } from '@/redux/store';
import { connectSocket as _connectSocket } from '@/redux/slices/webSocketSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';


export enum MessageType {
  User = "user",
  Assistant = "assistant"
}

class SocketClient {
  public socket: Socket = io('http://localhost:4001', { autoConnect: false });

  constructor() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
      
    this.socket.on('payment_message', (data) => {
      console.log('Incoming message:', data);
    });
      
    this.socket.on('content', (content, contentSnapshot, assistantMessageId, workspaceId) => {
      console.log("Content chunk:", content);
      console.log("Assistant message ID:", assistantMessageId);
      console.log("Content snapshot:", contentSnapshot);
    
      store.dispatch(
        updateChatMessage({ 
          workspaceId: workspaceId, 
          id: assistantMessageId, 
          content: contentSnapshot 
      }));
    });
    
    this.socket.on('retrieve-assistant-message', (assistantMessageId, workspaceId) => {
      store.dispatch(
        addChatHistory({ 
          workspaceId: workspaceId, 
          id: assistantMessageId, 
          role: MessageType.Assistant,
          content: '' 
      }));
    });
    
    this.socket.on('retrieve-user-message', (userMessageId, message, workspaceId) => {
      console.log("User message ID:", userMessageId);
      console.log("User message:", message);
      store.dispatch(updateChatLoadingStatus(false));
      store.dispatch(
        addChatHistory({ 
          workspaceId: workspaceId, 
          id: userMessageId, 
          role: MessageType.User,
          content: message 
      }));
    });
    
    this.socket.on('end', () => {
      console.log("Assistant response finished.")
    })
    
    this.socket.on('debug-log', (message) => {
      console.log("Websocket debug:", message)
    })
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }
}

export const socketClient = new SocketClient();

export const useSocket = () => {
  // const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [transactionRoomId, setTransactionRoomId] = useState<string>('');
  const [transactionData, setTransactionData] = useState({ status: '', id: '' });
  
  const dispatch = useAppDispatch();
  
  const socketConnected = useAppSelector((state: RootState) => state.webSocket.connected);
  
  const connectSocket = () => {
    socketClient.socket.connect();
    dispatch(_connectSocket(true));
  };

  const disconnectSocket = () => {
    socketClient.socket.disconnect();
  }

  const joinTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socketClient.socket.connected && socketConnected) {
      console.log("Connecting to room:", payment_intent_id);
      socketClient.socket.emit("join-room", payment_intent_id);
    } else {
      console.warn("Socket not connected. Waiting for connection to server...");
    }
  };

  const leaveTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socketClient.socket.connected && socketConnected) {
      console.log("Leaving room:", payment_intent_id);
      socketClient.socket.emit("leave-room", payment_intent_id);
    } else {
      console.warn("Socket not connected. Waiting for connection to server...");
    }
  }

  const sendMessageToAssistant = (message: string, workspaceId: string, chatHistory: Message[], maxHistorySize: number = 6) => {
    // Limit the chat history to the last `maxHistorySize` messages
    const limitedHistory = chatHistory.slice(-maxHistorySize);
    socketClient.socket.emit('new-message', message, workspaceId, limitedHistory);
  }
  return {
    socket: socketClient.socket,
    connectSocket,
    transactionData,
    setTransactionData,
    createTransaction: joinTransactionRoom,
    cancelTransaction: leaveTransactionRoom,
    sendMessageToAssistant,
    socketConnected,
  };
};
