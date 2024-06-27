// client/src/lib/hooks/user-context.tsx
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouteContext, RouteProvider } from '@/lib/hooks/context-providers/route-context';
import WindowActivityProvider from '@/lib/hooks/context-providers/window-activity-context';
import Cookies from 'js-cookie';
import { POST as autoLogin } from '@/app/api/auth/auto-login/route';

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
}

const defaultValue: UserContextValue = {
    user: null,
    setUser: () => { },
    clearUser: () => { },
};

export const UserContext = createContext<UserContextValue>(defaultValue);
export const useUserContext = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const { push } = useRouteContext();
    const initialized = useRef(false)
    
    async function checkAuth() {
        console.log("check auth")
        const { responseData, success } = await autoLogin(); // May return an AuthResponse or an error string
        if (success && responseData && responseData.user) {
            setUser(responseData.user);
            localStorage.setItem("user", JSON.stringify(responseData.user));
            push('/workspace'); // Redirect to /workspace if authenticated
        } else {
            console.error("Authentication failed:", responseData);
            push('/auth');
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

    return (
        <UserContext.Provider value={{ user, setUser: saveUser, clearUser }}>
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
