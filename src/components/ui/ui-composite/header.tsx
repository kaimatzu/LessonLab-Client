import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import { POST as logout } from '@/app/api/auth/logout/route';
import Overlay from '../ui-base/overlay';
import { Item } from './transaction/item';
import icon from '@/assets/icon.png';
import profileIcon from '@/assets/profileIcon.png';
import ThemeSwitcher from '../ui-base/theme-switcher';
import { useRouteContext } from '@/lib/hooks/context-providers/route-context';

const Header: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [transactionOngoing, setTransactionOngoing] = useState(false);
  const [checkoutWindow, setCheckoutWindow] = useState<Window>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown toggle

  const { user, clearUser } = useUserContext();
  const { getWindowPath } = useRouteContext();

  const closeShop = () => {
    setIsShopOpen(!isShopOpen);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      clearUser();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // TENTATIVE ITEMS, SHOULD BE REAL ITEMS DATA
  const items = [
    { name: '5 Tokens', amount: 5000, currency: 'PHP', description: 'Tokens used to generate lesson and quiz.' },
    { name: '50 Tokens', amount: 50000, currency: 'PHP', description: 'Tokens used to generate lesson and quiz.' },
    { name: '100 Tokens', amount: 100000, currency: 'PHP', description: 'Tokens used to generate lesson and quiz.' },
    { name: '500 Tokens', amount: 500000, currency: 'PHP', description: 'Tokens used to generate lesson and quiz.' },
    { name: '1000 Tokens', amount: 1000000, currency: 'PHP', description: 'Tokens used to generate lesson and quiz.' },
    // Add more items as needed
  ];

  const fontFamily = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, Inter, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbo'"
  }

  return (
    <div className="z-[200] mx-0 w-full p-4 shadow-lg select-none">
      <div className="relative flex justify-between items-center font-bold">
        <div className="flex left-40 top-10 items-center cursor-pointer">
          <Link className="flex items-center" href="/" passHref>
            <Image src={icon} alt="icon" width={32} height={32} />
            <span className="ml-2 text-2xl text-zinc-950 dark:text-zinc-50 font-bold tracking-wide" style={fontFamily}>LessonLab</span>
          </Link>
        </div>

        <div className="ml-auto flex space-x-4 justify-center align-center">
          <ThemeSwitcher className={'hover:bg-gray-100 dark:hover:bg-zinc-500 p-1 cursor-pointer flex justify-center items-center rounded-[4px]'} />
          <div className="relative">
            <Image
              src={profileIcon}
              alt="Profile"
              width={40}
              height={32}
              className="cursor-pointer"
              onClick={toggleDropdown} // Toggle dropdown on click
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 z-[300]"> {/* z-index added here */}
                {user && (
                  <>
                    <button
                      onClick={closeShop}
                      className="block text-left px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 mx-auto w-[90%] rounded"
                    >
                      Shop
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block text-left px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 mx-auto w-[90%] rounded"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Overlay isOpen={isShopOpen} onClose={closeShop} overlayName={"Token Shop"} overlayType="transaction">
          {transactionOngoing && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="loader text-white">Transaction Ongoing...</div>
            </div>
          )}
          <div className={`flex p-4 ${transactionOngoing ? "pointer-events-none" : ""}`}>
            {items.map((item, index) => (
              <Item key={index} item={item} checkoutWindow={checkoutWindow} setCheckoutWindow={setCheckoutWindow} />
            ))}
          </div>
        </Overlay>
      </div>
    </div>
  );
};

export default Header;