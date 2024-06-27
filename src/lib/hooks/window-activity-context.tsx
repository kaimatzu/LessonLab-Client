import React, { createContext, useEffect, useLayoutEffect, useState, useContext, useRef  } from "react";
import Cookies from "js-cookie";

const TAB_COUNT_KEY = "tabCount";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

interface WindowActivityContextValue {
    isActive: boolean;
    resetActivity: () => void;
}

const WindowActivityContext = createContext<
    WindowActivityContextValue | undefined
>(undefined);

const WindowActivityProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isActive, setIsActive] = useState(true);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            incrementTabCount();
        } 
    }, []); 

    useEffect(() => {
        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    const incrementTabCount = () => {
        const tabCount = parseInt(
            localStorage.getItem(TAB_COUNT_KEY) || "0",
            10
        );
        localStorage.setItem(TAB_COUNT_KEY, (tabCount + 1).toString());
    };

    const decrementTabCount = () => {
        const tabCount = parseInt(
            localStorage.getItem(TAB_COUNT_KEY) || "0",
            10
        );
        if (tabCount > 0) {
            localStorage.setItem(TAB_COUNT_KEY, (tabCount - 1).toString());
        }
    };

    const getTabCount = () => {
        return parseInt(localStorage.getItem(TAB_COUNT_KEY) || "0", 10);
    };

    const handleUnload = (event: BeforeUnloadEvent) => {     
        decrementTabCount();
        // event.preventDefault();
        // event.returnValue = true;
        if (getTabCount() === 0) {
            console.log('destroy')
        //     // Destroy worker on server
        //     fetch("/api/destroy-worker", {
        //         method: "POST",
        //         credentials: "include",
        //     }).catch((error) => {
        //         console.error("Error destroying worker:", error);
        //     });
        }
    };

    const handleActivity = () => {
        setIsActive(true);
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => {
            setIsActive(false);
            // Log out the user due to inactivity
            // fetch("/api/logout", {
            //     method: "POST",
            //     credentials: "include",
            // })
            //     .then(() => {
            //         // Optionally clear user context or local storage
            //         localStorage.removeItem("user");
            //         Cookies.remove("authToken");
            //     })
            //     .catch((error) => {
            //         console.error("Error during logout:", error);
            //     });
        }, INACTIVITY_TIMEOUT);
        setTimeoutId(id);
    };

    return (
        <WindowActivityContext.Provider value={{ isActive, resetActivity: handleActivity }}>
            {children}
        </WindowActivityContext.Provider>
    );
};

export const useWindowActivity = () => {
    const context = useContext(WindowActivityContext);
    if (context === undefined) {
        throw new Error(
            "useWindowActivity must be used within a WindowActivityProvider"
        );
    }
    return context;
};

export default WindowActivityProvider;
