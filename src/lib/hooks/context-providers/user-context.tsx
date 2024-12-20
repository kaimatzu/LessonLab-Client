// client/src/lib/hooks/user-context.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouteContext, RouteProvider } from '@/lib/hooks/context-providers/route-context';
import WindowActivityProvider from '@/lib/hooks/context-providers/window-activity-context';
import Cookies from 'js-cookie';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { checkAuth, clearUser, setUser } from '@/redux/slices/userSlice';
import { useSocket } from '@/lib/hooks/useServerEvents';
import { useBroadcastChannel } from '@/lib/hooks/useBroadcastChannel';
import { User } from "@/lib/types/user-types";

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserContextValue {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  isTransactionFinished: boolean;
  createTransaction: (payment_intent_id: string) => void;
  cancelTransaction: (payment_intent_id: string) => void;
  setIsTransactionFinished: React.Dispatch<React.SetStateAction<boolean>>;
  setTransactionStatus: React.Dispatch<React.SetStateAction<string>>;
  broadcastChannel: BroadcastChannel | null;
  transactionStatus: string;
}

const defaultValue: UserContextValue = {
  user: null,
  setUser: () => { },
  clearUser: () => { },
  isTransactionFinished: false,
  createTransaction: () => { },
  cancelTransaction: () => { },
  setIsTransactionFinished: () => { },
  setTransactionStatus: () => { },
  broadcastChannel: null,
  transactionStatus: '',
};

export const UserContext = createContext<UserContextValue>(defaultValue);
export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const { push, getCurrentPath } = useRouteContext();
  const initialized = useRef(false);

  const {
    broadcastChannel,
    transactionStatus,
    isTransactionFinished,
    setTransactionStatus,
    setIsTransactionFinished,
  } = useBroadcastChannel('transaction_status');

  const {
    socket,
    connectSocket,
    transactionData,
    setTransactionData,
    createTransaction,
    cancelTransaction,
    socketConnected,
  } = useSocket();


  useEffect(() => {
    // console.log("Checking for auth");
    const checkAuthStatus = async () => {
      const authToken = Cookies.get('autoLoginToken');
      // console.log(authToken)
      const pathname = getCurrentPath();

      if (!authToken) {
        if (!pathname.startsWith('/auth') && !pathname.startsWith('/')) {
          push('/auth'); // Redirect to /auth if no authToken
        }
        return;
      }

      if (!initialized.current) {
        initialized.current = true;
        const resultAction = await dispatch(checkAuth());

        if (checkAuth.fulfilled.match(resultAction)) {
          connectSocket(resultAction.payload.userId);
          console.log("Path name", pathname);
          if (!pathname.startsWith('/workspace') && !pathname.startsWith('/transaction') && !pathname.startsWith('/assessment')) {
            push('/workspace'); // Redirect to /workspace if authenticated
          }
        } else {
          if (!pathname.startsWith('/auth')) {
            push('/auth'); // Always redirect to /auth if unauthenticated
          }
        }
      }
    };

    checkAuthStatus();
  }, [dispatch, push, getCurrentPath]);

  // TODO: This still needs to be called somewhere. 
  const saveUser = (user: User) => {
    dispatch(setUser(user));
    localStorage.setItem('user', JSON.stringify(user));
  };

  const clearUserData = () => {
    dispatch(clearUser());
    localStorage.removeItem('user');
    Cookies.remove('authToken');
    Cookies.remove('autoLoginToken');
    push('/auth'); // Redirect to /auth on logout
  };

  useEffect(() => {
    // Fires when transaction window is ready to receive data and data is processed.
    if (transactionData.id !== '' && transactionData.status !== '' && socketConnected) {
      console.log('Broadcasting message:', transactionData);
      broadcastChannel!.postMessage(transactionData);

      // Reset transaction data
      setTransactionData({ status: '', id: '' });
      setIsTransactionFinished(false);
    }
  }, [transactionData, broadcastChannel, setTransactionData, setIsTransactionFinished, socketConnected]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: saveUser,
        clearUser: clearUserData,
        isTransactionFinished,
        createTransaction,
        cancelTransaction,
        setIsTransactionFinished,
        setTransactionStatus,
        broadcastChannel,
        transactionStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Wrapping the UserProvider with RouteProvider
export const CombinedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WindowActivityProvider>
    <RouteProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </RouteProvider>
  </WindowActivityProvider>
);