import React, { useEffect, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Adjust the import path to your actual utils file
import '../../css/custom-scrollbar.css'
import ChatSidenav from '@/components/ui/ui-composite/workspace/chat/chat-sidenav';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  overlayName: string;
  overlayType: 'transaction' | 'auth' | 'chat' | 'quizExport';
}

const overlayBackgroundStyles = cva('fixed h-full w-full bg-black top-0 left-0 cursor-pointer transition-opacity z-[250]', {
  variants: {
    hidden: {
      true: 'opacity-0',
      false: 'opacity-50',
    },
  },
  defaultVariants: {
    hidden: false,
  },
});

const overlayContainerStyles = cva('fixed top-0 right-0 left-0 m-auto bg-background rounded-lg z-[260] transition-opacity', {
  variants: {
    hidden: {
      true: 'opacity-0',
      false: 'opacity-100',
    },
    overlayType: {
      transaction: 'bottom-0 h-fit w-fit p-8',
      auth: 'inset-y-0 right-auto left-0 fixed h-screen w-2/5 p-8 !rounded-none',
      chat: 'bottom-7 top-7 w-5/6 h-6/7 bg-background overflow-auto no-scrollbar',
      quizExport: 'bottom-0 h-fit w-fit p-4',
    },
  },
  defaultVariants: {
    hidden: false,
    overlayType: 'transaction',
  },
});

const headerStyles = cva('flex justify-between items-center p-2', {
  variants: {
    overlayType: {
      transaction: 'bg-zinc-900',
      auth: 'bg-zinc-900',
      chat: 'bg-[#F1F3F8] border-b border-gray-300',
      quizExport: 'bg-zinc-900'
    },
  },
  defaultVariants: {
    overlayType: 'transaction',
  },
});

export default function Overlay({ isOpen, onClose, children, overlayName, overlayType }: OverlayProps) {
  const isClosable = overlayType !== 'auth';

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isClosable) {
        onClose();
      }
    };

    if (isOpen && isClosable) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, isClosable]);

  return (
    <>
      {isOpen && (
        <div className={isClosable ? 'fixed top-0 left-0 z-[999] overlay' : 'relative w-full overlay'}>
          {isClosable && (
            <div
              className={cn(overlayBackgroundStyles({ hidden: !isOpen }), 'overlay-background')}
              onClick={onClose}
            />
          )}
          <div className={cn(
            overlayContainerStyles({ hidden: !isOpen, overlayType }),
            'overlay-container',
            'flex flex-col overflow-y-auto'
          )}>
            <div className={cn(
              headerStyles({ overlayType }),
              overlayType === 'chat' ? 'sticky top-0 z-10 bg-background' : 'bg-background'
            )}>
              <h1 className={cn(
                "text-lg font-semibold ml-3",
                overlayType === 'chat' ? 'text-foreground bg-background' : 'text-foreground bg-background'
              )}>
                {/* {overlayName} */}
                {overlayType === 'chat' && 'AI Assistant'}
              </h1>
              {isClosable && (
                <button
                  className={cn(
                    "border-none bg-transparent text-2xl cursor-pointer hover:bg-gray-200 rounded-md w-8 h-8 flex items-center justify-center",
                    overlayType === 'chat' ? 'text-foreground' : 'text-foreground'
                  )}
                  type="button"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
            </div>
            <div className={overlayType === 'chat' ? 'flex h-screen overflow-hidden': ''}>
              <div className={overlayType === 'chat' ? 'flex-grow overflow-auto no-scrollbar' : ''}>
                {children}
              </div>
              {overlayType === 'chat' ? <ChatSidenav/> : <></>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}