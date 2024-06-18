import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import profileIcon from '@/assets/profileIcon.png';
import { Overlay } from '../ui-base/overlay'; 
import { Item } from './transaction/item'; // Adjust the import path as necessary
import LoginForm from './login-form'; 
import SignUpForm from './signup-form';
import { cn } from '@/lib/utils'; 

const Header: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // TODO: Handle authentication
  const [isLoginForm, setIsLoginForm] = useState(true);

  const closeForm = () => {
    setIsFormOpen(!isFormOpen);
    setIsLoginForm(true);
  };

  const closeShop = () => {
    setIsShopOpen(!isShopOpen);
  };

  const switchForm = () => {
    setIsLoginForm(!isLoginForm);
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
    <div className="container z-[200] mx-auto p-4 shadow-lg" style={{ userSelect: 'none' }}>
      <div className="relative flex justify-between items-center font-bold">
        <div className="flex left-40 top-10 items-center cursor-pointer">
          <Link className="flex items-center" href="/" passHref>
            <Image src={icon} alt="icon" width={32} height={32} />
            <span className="ml-2 text-xl text-black">LessonLab</span>
          </Link>
        </div>

        <div className="ml-auto flex space-x-4">
          {isLoggedIn ? (
            <button className="relative px-4 py-2 bg-[#f1c41b] text-black rounded hover:bg-green-600" onClick={closeForm}>
              Login
            </button>
          ) : null}
          <button className="relative px-4 py-2 bg-[#f1c41b] text-black rounded hover:bg-blue-600" onClick={closeShop}>
            Shop
          </button>
          <Image src={profileIcon} alt="Profile" width={40} height={32} className="cursor-pointer" />
        </div>

        <Overlay isOpen={isFormOpen || isLoggedIn === false} onClose={closeForm} overlayName={"LessonLab"}>
          <div className="p-4">
            {isLoginForm ? <LoginForm onSwitchToSignUp={switchForm} /> : <SignUpForm onSwitchToLogin={switchForm} />}
          </div>
        </Overlay>

        <Overlay isOpen={isShopOpen} onClose={closeShop} overlayName={"Token Shop"}>
          <div className="p-4">
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
