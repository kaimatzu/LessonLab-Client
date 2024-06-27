// client/src/lib/hooks/route-context.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface RouteContextValue {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  const push = (path: string) => {
    router.push(path);
  };

  const replace = (path: string) => {
    router.replace(path);
  };

  const back = () => {
    router.back();
  };

  return (
    <RouteContext.Provider value={{ push, replace, back }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRouteContext = () => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return context;
};
