import { useState } from 'react';
import io, { Socket } from 'socket.io-client';

import { updateChatLoadingStatus, addChatHistory, updateChatMessage, replaceChatMessage, addModule, setSelectedModuleId, fetchWorkspaceModuleData, replaceModuleNodeContent } from '@/redux/slices/workspaceSlice';

import store, { RootState } from '@/redux/store';
import { connectSocket as _connectSocket } from '@/redux/slices/webSocketSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Module } from '../types/workspace-types';
import { throttle } from 'lodash';

// #region Enums
export enum MessageRole {
  User = "user",
  Assistant = "assistant"
}

export enum MessageType {
  Standard = "standard",
  Action = "action"
}

// #region class SocketClient
class SocketClient {
  public socket: Socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`, { autoConnect: false });

  constructor() {
    // this.socket.on('connect', () => {
    //   console.log('Connected to server');
    // });
      
    this.socket.on('payment_message', (data) => {
      console.log('Incoming message:', data);
    });
      

    const throttledReplaceChatMessage = throttle(
      (workspaceId: string, assistantMessageId: string, contentSnapshot: string) => {
        // Parse and format the content before dispatching
        let parsedContent = contentSnapshot;

        if (typeof contentSnapshot === 'string') {
          parsedContent = contentSnapshot.trim();
          parsedContent = parsedContent.replace(/^"|"$/g, ''); // Remove leading and trailing double quotes if they exist
          parsedContent = parsedContent.replace(/\\n/g, '\n'); // Replace escaped newlines with actual newlines
        }

        // Dispatch the pre-parsed content
        store.dispatch(
          replaceChatMessage({
            workspaceId,
            id: assistantMessageId,
            content: parsedContent,
          })
        );
      },
      150, // Throttle the action to once every 150ms
      { leading: true, trailing: true }
    );
    
    this.socket.on('content', (contentDelta, contentSnapshot, assistantMessageId, workspaceId) => {
      console.log("Content chunk:", contentDelta);
      console.log("Content snapshot:", contentSnapshot);
      console.log("Assistant message ID:", assistantMessageId);
      // store.dispatch(
      //   // updateChatMessage({ 
      //   //   workspaceId: workspaceId, 
      //   //   id: assistantMessageId, 
      //   //   contentDelta: contentDelta 
      //   // })
      //   replaceChatMessage({ 
      //     workspaceId: workspaceId, 
      //     id: assistantMessageId, 
      //     content: contentSnapshot 
      //   })
      // );

      throttledReplaceChatMessage(workspaceId, assistantMessageId, contentSnapshot);
    });
    
    this.socket.on('initialize-assistant-message', (assistantMessageId, type, workspaceId) => {
      store.dispatch(
        addChatHistory({ 
          workspaceId: workspaceId, 
          id: assistantMessageId, 
          role: MessageRole.Assistant,
          type: type,
          content: '' 
      }));
    });
    
    this.socket.on('initialize-user-message', (userMessageId, message, type, workspaceId) => {
      console.log("User message ID:", userMessageId);
      console.log("User message:", message);
      store.dispatch(
        addChatHistory({ 
          workspaceId: workspaceId, 
          id: userMessageId, 
          role: MessageRole.User,
          type: type,
          content: message 
      }));
    });
    
    this.socket.on('end', () => {
      store.dispatch(updateChatLoadingStatus(false));
      console.log("Assistant response finished.")
    });
    
    this.socket.on('debug-log', (message) => {
      console.log("Websocket debug:", message)
    });

    this.socket.on('chatCompletion', (completion, workspaceId) => {
      console.log("Chat completion object:", completion, workspaceId)
    });

    this.socket.on('finalChatCompletion', (finalChatCompletion, workspaceId) => {
      console.log("Final chat completion object:", finalChatCompletion, workspaceId)
    });
    
    this.socket.on('create-module', async (moduleId, workspaceId, name, description, callback) => {
      console.log('Creating module...');
    
      const module: Module = {
        id: moduleId,
        name: name,
        description: description,
        nodes: []
      };
    
      console.log('Module data:', module);
    
      store.dispatch(addModule({ workspaceId, module }));
      // store.dispatch(setSelectedModuleId(moduleId));
      store
      .dispatch(fetchWorkspaceModuleData(moduleId))
      .then((resultAction) => {
        if (fetchWorkspaceModuleData.fulfilled.match(resultAction)) {
          console.log('Module data fetched successfully');
          // Execute the callback after the data has been fetched
          callback('module-created');
        } else {
          console.error('Failed to fetch module data:', resultAction);
          callback('module-fetch-failed'); // Optional: Notify of failure
        }
      })
      .catch((error) => {
        console.error('Error during fetching module data:', error);
        callback('module-fetch-error'); // Optional: Notify of error
      });
    });

    const throttledReplaceModuleNodeContent = throttle(
      (workspaceId: string, moduleId: string, moduleNodeId: string, contentSnapshot: string) => {
        // Pre-parse the contentSnapshot before dispatching
        let parsedContent = contentSnapshot;
    
        if (typeof contentSnapshot === 'string') {
          parsedContent = contentSnapshot.trim();
    
          parsedContent = parsedContent.replace(/\\n/g, '\n');
        }
    
        // Dispatch the pre-parsed content
        store.dispatch(replaceModuleNodeContent({ workspaceId, moduleId, moduleNodeId, content: parsedContent }));
      },
      150, // Throttle the action to once every 150ms
      { leading: true, trailing: true } // Allow both leading and trailing calls
    );
    
    this.socket.on('update-module-node', (moduleId, moduleNodeId, workspaceId, contentDelta, contentSnapshot) => {
      const state: RootState = store.getState();
      const selectedModuleId = state.workspace.selectedModuleId;
    
      if (selectedModuleId === moduleId) {
        console.log("Throttled update for module node:", moduleId, moduleNodeId, workspaceId);
        throttledReplaceModuleNodeContent(workspaceId, moduleId, moduleNodeId, contentSnapshot);
      }
    });
    

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      throttledReplaceModuleNodeContent.cancel();
    });
  }

  public setQueryParams(params: Record<string, string>): void {
    this.socket.io.opts.query = params;
  }
}

export const socketClient = new SocketClient();
// #region useSocket
export const useSocket = () => {
  // const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [transactionRoomId, setTransactionRoomId] = useState<string>('');
  const [transactionData, setTransactionData] = useState({ status: '', id: '' });
  
  const dispatch = useAppDispatch();
  
  const socketConnected = useAppSelector((state: RootState) => state.webSocket.connected);

  // #region Connect Socket
  const connectSocket = (userId: string) => {
    socketClient.setQueryParams({ userId: userId });
  
    // Listen for the connect event
    socketClient.socket.on('connect', () => {
      console.log('Socket connected, requesting acknowledgment...');
      
      // Emit an event to the server to request acknowledgment
      socketClient.socket.emit('request-ack', userId, (ack: string) => {
        if (ack === 'success') {
          console.log('Acknowledgment received, dispatching action');
          dispatch(_connectSocket(true));
        } else {
          console.error('Acknowledgment failed:', ack);
        }
      });
    });
  
    // Connect the socket
    socketClient.socket.connect();
  };
  

  // #region Disconnect Socket
  const disconnectSocket = () => {
    socketClient.socket.disconnect();
  }

  // #region Join Transaction Room
  const joinTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socketClient.socket.connected && socketConnected) {
      console.log("Connecting to room:", payment_intent_id);
      socketClient.socket.emit("join-room", payment_intent_id);
    } else {
      console.warn("Socket not connected. Waiting for connection to server...");
    }
  };

  // #region Leave Transaction Room
  const leaveTransactionRoom = (payment_intent_id: string) => {
    console.log(payment_intent_id);

    if (socketClient.socket.connected && socketConnected) {
      console.log("Leaving room:", payment_intent_id);
      socketClient.socket.emit("leave-room", payment_intent_id);
    } else {
      console.warn("Socket not connected. Waiting for connection to server...");
    }
  }

  // #region Join Workspace Room
  const joinWorkspaceRoom = (workspaceId: string | null) => {
    console.log("Connecting to room:", workspaceId);

    if (socketClient.socket.connected && socketConnected) {
      socketClient.socket.emit("leave-all-rooms");

      if (workspaceId) {
        socketClient.socket.emit("join-room", workspaceId);
      }

      console.log("Emit connect:", workspaceId);
    } else {
      console.warn("Socket not connected. Waiting for connection to server...");
    }
  };

  // #region Send Message to Assistant
  const sendMessageToAssistant = (message: string, userId: string, workspaceId: string, chatHistory: Message[], maxHistorySize: number = 6) => {
    console.log(userId)
    // Limit the chat history to the last `maxHistorySize` messages
    const limitedHistory = chatHistory.slice(-maxHistorySize);
    socketClient.socket.emit('new-message', message, userId, workspaceId, limitedHistory);
  }
  return {
    socket: socketClient.socket,
    connectSocket,
    transactionData,
    setTransactionData,
    createTransaction: joinTransactionRoom,
    cancelTransaction: leaveTransactionRoom,
    joinWorkspaceRoom,
    sendMessageToAssistant,
    socketConnected,
  };
};
