import React, { useEffect, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Adjust the import path to your actual utils file

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  overlayName: string;
  closable: boolean;
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

const overlayContainerStyles = cva('fixed h-fit w-fit top-0 right-0 bottom-0 left-0 m-auto p-8 bg-zinc-900 rounded-lg z-[260] transition-opacity', {
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

const embeddedOverlayContainerStyles = cva('relative h-fit w-fit mx-auto p-8 bg-zinc-900 rounded-lg transition-opacity', {
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

export default function Overlay({ isOpen, onClose, children, overlayName, closable }: OverlayProps) {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen && closable) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, closable]);

  return (
    <>
      {isOpen && (
        <div className={closable ? 'fixed top-0 left-0 z-[999] overlay' : 'relative w-full overlay'}>
          {closable && (
            <div
              className={cn(overlayBackgroundStyles({ hidden: !isOpen }), 'overlay-background')}
              onClick={onClose}
            />
          )}
          <div className={cn(
            closable ? overlayContainerStyles({ hidden: !isOpen }) : embeddedOverlayContainerStyles({ hidden: !isOpen }),
            'overlay-container'
          )}>
            <div className="flex justify-between items-center py-1">
              <h1 className="text-2xl font-semibold text-white">{overlayName}</h1>
              {closable && (
                <button
                  className="border-none bg-transparent text-white text-2xl cursor-pointer hover:bg-yellow-500 rounded-full"
                  type="button"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}


// export default function Overlay({ isOpen, onClose, children, overlayName, closable }: OverlayProps) {
//   useEffect(() => {
//     const handleEscapeKey = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' && closable) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleEscapeKey);
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscapeKey);
//     };
//   }, [isOpen, onClose, closable]);


//   return (
//     <>
//       {isOpen && (
//         <div className="fixed top-0 left-0 z-[999] overlay">
//           {closable && (
//             <div
//               className={cn(overlayBackgroundStyles({ hidden: !isOpen }), 'overlay-background')}
//               onClick={onClose}
//             />
//           )}
//           <div className={cn(overlayContainerStyles({ hidden: !isOpen }), 'overlay-container')}>
//             <div className="flex justify-between items-center py-1">
//               <h1 className="text-2xl font-semibold text-white">{overlayName}</h1>
//               {closable && (
//                 <button
//                   className="border-none bg-transparent text-white text-2xl cursor-pointer hover:bg-yellow-500 rounded-full"
//                   type="button"
//                   onClick={onClose}
//                 >
//                   &times;
//                 </button>
//               )}
//             </div>
//             {children}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };
