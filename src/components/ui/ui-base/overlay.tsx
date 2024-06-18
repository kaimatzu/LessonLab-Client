import React, { useEffect, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Adjust the import path to your actual utils file

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  overlayName: string;
}

const overlayBackgroundStyles = cva('fixed top-0 left-0 cursor-pointer transition-opacity z-[250]', {
  variants: {
    hidden: {
      true: 'opacity-0',
      false: 'opacity-100',
    },
  },
  defaultVariants: {
    hidden: false,
  },
});

const overlayContainerStyles = cva('fixed h-fit w-fit top-0 right-0 bottom-0 left-0 m-auto p-8 bg-gray-800 rounded-lg z-[260] transition-opacity', {
  variants: {
    hidden: {
      true: 'opacity-0',
      false: 'opacity-100',
    },
  },
  defaultVariants: {
    hidden: false,
  },
});

// const overlayBackgroundStyles = cva('fixed top-0 left-0 w-full h-full cursor-pointer transition-opacity z-50', {
//   variants: {
//     hidden: {
//       true: 'opacity-0',
//       false: 'opacity-100',
//     },
//   },
// });

// const overlayContainerStyles = cva('fixed top-0 right-0 bottom-0 left-0 m-auto p-8 bg-gray-800 rounded-lg z-60 transition-opacity', {
//   variants: {
//     hidden: {
//       true: 'opacity-0',
//       false: 'opacity-100',
//     },
//   },
// });
export const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, children, overlayName }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className='fixed top-0 left-0 z-[999] overlay'>
          <div
            className={cn(overlayBackgroundStyles({ hidden: !isOpen }), 'overlay-background')} 
            onClick={onClose}
          />
          <div className={cn(overlayContainerStyles({ hidden: !isOpen }), 'overlay-container')}>
            <div className="flex justify-between items-center pb-20">
              <h1 className="text-2xl font-semibold text-white absolute top-5 left-8">{overlayName}</h1>
              <button
                className="absolute top-2 right-2 w-10 h-10 border-none bg-transparent text-white text-2xl cursor-pointer hover:bg-yellow-500 rounded-full"
                type="button"
                onClick={onClose}
              >
                &times;
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
};
