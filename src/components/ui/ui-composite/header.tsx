import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import { POST as logout } from '@/app/api/auth/logout/route';
import Overlay from '../ui-base/overlay';
import { Item } from './transaction/store-item';
import profileIcon from '@/assets/profileIcon.png';
import { useRouteContext } from '@/lib/hooks/context-providers/route-context';
import { Button } from '../ui-base/button';
import HypertextLogo from '@/assets/hypertext-logo';
import { MdGeneratingTokens } from "react-icons/md";
import { selectUser } from '@/redux/slices/userSlice';
import store from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';

const Header: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [transactionOngoing, setTransactionOngoing] = useState(false);
  const [checkoutWindow, setCheckoutWindow] = useState<Window>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown toggle

  const { user, clearUser } = useUserContext();
  // const { getWindowPath } = useRouteContext();

  const tokens = user?.tokens ?? 0;

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

  const items = [
    { name: '100,000,000', amount: 50000, currency: 'PHP', description: 'Tokens used to generate.' },
    { name: '200,000,000', amount: 100000, currency: 'PHP', description: 'Tokens used to generate.' },
    { name: '300,000,000', amount: 150000, currency: 'PHP', description: 'Tokens used to generate.' },
    { name: '400,000,000', amount: 200000, currency: 'PHP', description: 'Tokens used to generate.' },
    { name: '500,000,000', amount: 250000, currency: 'PHP', description: 'Tokens used to generate.' },
  ];

  useEffect(() => {
    console.log('>>> %ctokens: ', 'color: #bada55', tokens);
  }, [user])

  return (
    <header className="z-[200] mx-0 w-full p-2 border-b border-gray-300 select-none !bg-white">
      <div className="relative flex justify-between items-center font-bold">
        <div className="flex left-40 top-10 items-center cursor-pointer">
          <Link className="flex items-center" href="/" passHref>
            <HypertextLogo width={24} height={24}/>
            {/* <span className="ml-2 text-2xl text-zinc-950 dark:text-zinc-50 font-bold tracking-wide font-sans">LessonLab</span> */}
          </Link>
        </div>

        
        <div className="ml-auto flex space-x-4 justify-center align-center">
          <div className="ml-auto flex space-x-4 justify-center items-center">
            <div className="flex items-center space-x-1 mr-4">
              <MdGeneratingTokens size={18} className="text-[#5e77d3]" />
              <span className="text-sm font-bold">
                {tokens}
              </span>
            </div>
          </div>

          <div>
            {user && user.name}
          </div>

          <div className="relative">
            <Image
              src={profileIcon}
              alt="Profile"
              width={24}
              height={24}
              className="cursor-pointer"
              onClick={toggleDropdown} // Toggle dropdown on click
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-800 shadow-lg border border-border rounded-md py-4 z-[300] flex gap-2 flex-col"> {/* z-index added here */}
                {user && (
                  <>
                    <Button
                      variant={'ghost'}
                      onClick={closeShop}
                      className="block text-left px-2 py-2 text-zinc-800 dark:text-zinc-100 hover:bg-[#5e77d3] dark:hover:bg-primary hover:text-black dark:hover:text-black mx-auto w-[80%] rounded"
                    >
                      Token Store
                    </Button>
                    <Button
                      variant={'ghost'}
                      onClick={handleLogout}
                      className="block text-left px-2 py-2 text-zinc-800 dark:text-zinc-100 hover:bg-[#5e77d3] dark:hover:bg-primary hover:text-black dark:hover:text-black mx-auto w-[80%] rounded"
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <Overlay isOpen={isShopOpen} onClose={closeShop} overlayName={"Token Shop"} overlayType="transaction" className='bg-zinc-50'>
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
    </header>
  );
};

export default Header;