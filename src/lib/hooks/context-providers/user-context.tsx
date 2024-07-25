// client/src/lib/hooks/user-context.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouteContext, RouteProvider } from '@/lib/hooks/context-providers/route-context';
import WindowActivityProvider from '@/lib/hooks/context-providers/window-activity-context';
import Cookies from 'js-cookie';
import { POST as autoLogin } from '@/app/api/auth/auto-login/route';
import io, { Socket } from 'socket.io-client';

export interface User {
    userId: string;
    userType: "STUDENT" | "TEACHER";
    name: string;
    email: string;
    tokens: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface UserContextValue {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    connectSocket: (payment_intent_id: string) => void;
    isTransactionFinished: boolean;
    setIsTransactionFinished: React.Dispatch<React.SetStateAction<boolean>>;
    broadcastChannel: BroadcastChannel | null;
    transactionStatus: string;
}

const defaultValue: UserContextValue = {
    user: null,
    setUser: () => { },
    clearUser: () => { },
    connectSocket: () => { },
    isTransactionFinished: false,
    setIsTransactionFinished: () => {},
    broadcastChannel: null,
    transactionStatus: '',
};

export const UserContext = createContext<UserContextValue>(defaultValue);
export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const { push, getCurrentPath } = useRouteContext();
    const initialized = useRef(false)

    const [socket, setSocket] = useState<Socket>(io('http://localhost:4001', {autoConnect: false}));
    const [socketConnected, setSocketConnected] = useState<boolean>(false);
    const [transactionRoomId, setTransactionRoomId] = useState<string>('');
    const [isTransactionFinished, setIsTransactionFinished] = useState<boolean>(false);

    const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel>(new BroadcastChannel('transaction_status'));
    const [transactionData, setTransactionData] = useState({ status: '', id: '' });
    const [transactionWindowReady, setTransactionWindowReady] = useState<boolean>(false);
    const [transactionStatus, setTransactionStatus] = useState<string>('');

    // async function checkAuth() {
    //     console.log("check auth");
    //     console.log(getCurrentPath());

    //     const { responseData, success } = await autoLogin(); // May return an AuthResponse or an error string
    //     if (success && responseData && responseData.user) {
    //         setUser(responseData.user);
    //         localStorage.setItem("user", JSON.stringify(responseData.user));
    //         push('/workspace'); // Redirect to /workspace if authenticated
    //     } else {
    //         console.error("Authentication failed:", responseData);
    //         push('/auth');
    //     }
    // };

    const checkAuth = async() => {
        console.log("check auth");
        const pathname = getCurrentPath(); // Get the current route path
        const { responseData, success } = await autoLogin(); // May return an AuthResponse or an error string
        
        if (success && responseData && responseData.user) {
            console.log("Authentication successful:", responseData);

            setUser(responseData.user);
            localStorage.setItem("user", JSON.stringify(responseData.user));
    
            // Check if the current path is not in workspace or transaction paths
            if (!pathname.startsWith('/workspace') && !pathname.startsWith('/transaction')) {
                push('/workspace'); // Redirect to /workspace if authenticated
            }
        } else {
            console.error("Authentication failed:", responseData);
            if (!pathname.startsWith('/auth')) {
                push('/auth'); // Always redirect to /auth if unauthenticated
            }
        }
    };

    
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            checkAuth();
        }
    }, [push, initialized]);

    const saveUser = (user: User) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("user");
        Cookies.remove('authToken');
        push('/auth'); // Redirect to /auth on logout
    };

    // Transaction functions

    useEffect(() => {
        console.log("Initializing server socket connections...");

        socket.on('connect', () => {
            console.log('Connected to server');
            setSocketConnected(true);
        });
          
        socket.on('payment_message', (data) => {
            console.log('Incoming message:', data);
            setTransactionData({ status: data.payment_status, id: data.payment_intent_id });
            // broadcastChannel.postMessage({ status: data.payment_status, id: data.payment_intent_id });
            // setIsTransactionFinished(true); // Set to true so the transaction result window can close if this value is changed. 
            socket.disconnect();
            setSocketConnected(false);
        }); 
          
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        })
    }, [])

    useEffect(() => {
        console.log("Initializing broadcast channel connections...");

        broadcastChannel.onmessage = (event) => {
            console.log('Receiving message:', event.data);
            
            // This is used by the transaction complete window
            if (event.data.status) {
                console.log("Transaction status:", event.data.status);
                setTransactionStatus(event.data.status);
                setIsTransactionFinished(true); // Set to true so the transaction result window can close if this value is changed. 
            }

            // This is used by the original context window
            if (event.data.transaction_window_ready) {
                console.log("Other transaction window ready to recieve processed data.");
                setTransactionWindowReady(true);
                // console.log('Broadcasting message:', transactionData);
                // broadcastChannel.postMessage(transactionData);
            }
        }
    }, [])

    useEffect(() => {
        const retrieveData = async (roomId: string): Promise<void> => {
            console.log("Transaction room id:", transactionRoomId);

            if (socket.connected) {
              console.log("Connecting to room:", roomId);
              socket.emit("room", roomId);
            } else {
              console.error("Socket not connected");
            }
        }

        if (transactionRoomId !== '' && socketConnected) {
            console.log("Socket status:", socket.connected)
            retrieveData(transactionRoomId);
        }
    }, [transactionRoomId, socketConnected])

    useEffect(() => {
        // Fires when transaction window is ready to recieve data and data is processed.
        if (transactionData.id !== '' && transactionData.status !== '' && transactionWindowReady) {
            console.log('Broadcasting message:', transactionData);
            broadcastChannel.postMessage(transactionData);

            // Reset transaction data
            setTransactionData({status: '', id: ''})
            setTransactionWindowReady(false);
        }
    }, [transactionData, transactionWindowReady]);

    const connectSocket = async (payment_intent_id: string): Promise<void> => {
        socket.connect();
        console.log(payment_intent_id);
        setTransactionRoomId(payment_intent_id);
    }

    return (
        <UserContext.Provider value={{ user, setUser: saveUser, clearUser, connectSocket, isTransactionFinished, setIsTransactionFinished, broadcastChannel, transactionStatus }}>
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