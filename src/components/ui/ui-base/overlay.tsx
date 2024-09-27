import React, { useEffect, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Adjust the import path to your actual utils file
import '../css/custom-scrollbar.css'

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
      chat: 'bottom-[20%] w-3/4 h-3/4 bg-background px-8 pb-4 overflow-auto no-scrollbar',
      quizExport: 'bottom-0 h-fit w-fit p-4',
    },
  },
  defaultVariants: {
    hidden: false,
    overlayType: 'transaction',
  },
});

const headerStyles = cva('flex justify-between items-center py-2 px-4', {
  variants: {
    overlayType: {
      transaction: 'bg-zinc-900',
      auth: 'bg-zinc-900',
      chat: 'bg-white border-b border-gray-200 mt-6',
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
            'flex flex-col justify-center'
          )}>
            <div className={cn(
              headerStyles({ overlayType }),
              overlayType === 'chat' ? 'sticky top-0 z-10 bg-background' : 'bg-background'
            )}>
              <h1 className={cn(
                "text-2xl font-semibold",
                overlayType === 'chat' ? 'text-foreground bg-background' : 'text-foreground bg-background'
              )}>
                {/* {overlayName} */}
              </h1>
              {isClosable && (
                <button
                  className={cn(
                    "border-none bg-transparent text-2xl cursor-pointer hover:bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center",
                    overlayType === 'chat' ? 'text-foreground' : 'text-foreground'
                  )}
                  type="button"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
            </div>
            <div className={overlayType === 'chat' ? 'flex-grow overflow-auto p-4 no-scrollbar' : ''}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}