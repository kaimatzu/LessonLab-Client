import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserContext } from '@/lib/hooks/user-context';
import { POST as logout } from '@/app/api/auth/logout/route';
import Overlay from '../ui-base/overlay';
import { Item } from './transaction/item';
import icon from '@/assets/icon.png';
import profileIcon from '@/assets/profileIcon.png';

const Header: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { user, clearUser } = useUserContext();

  const closeShop = () => {
    setIsShopOpen(!isShopOpen);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      clearUser();
    }
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

  return (
    <div className="z-[200] mx-0 w-full p-4 shadow-lg" style={{ userSelect: 'none' }}>
      <div className="relative flex justify-between items-center font-bold">
        <div className="flex left-40 top-10 items-center cursor-pointer">
          <Link className="flex items-center" href="/" passHref>
            <Image src={icon} alt="icon" width={32} height={32} />
            <span className="ml-2 text-xl text-black">LessonLab</span>
          </Link>
        </div>

        <div className="ml-auto flex space-x-4">
          {user ? <button className="relative px-4 py-2 bg-[#f1c41b] text-black rounded hover:bg-yellow-500" onClick={handleLogout}>
            Logout
          </button>
          : null}
          <button className="relative px-4 py-2 bg-[#f1c41b] text-black rounded hover:bg-yellow-500" onClick={closeShop}>
            Shop
          </button>
          <Image src={profileIcon} alt="Profile" width={40} height={32} className="cursor-pointer" />
        </div>

        <Overlay isOpen={isShopOpen} onClose={closeShop} overlayName={"Token Shop"} closable={true}>
          <div className="flex p-4">
            {items.map((item, index) => (
              <Item key={index} item={item} />
            ))}
          </div>
        </Overlay>
      </div>
    </div>
  );
};

export default Header;
