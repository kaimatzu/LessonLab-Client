// components/LoginForm.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import { cn } from '@/lib/utils';
import HypertextLogo from '@/assets/hypertext-logo';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  handleSubmit: (e: React.SyntheticEvent) => any;
}

export default function LoginForm({ onSwitchToRegister, handleSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className={cn("w-fit h-fit mx-auto p-5 rounded-lg bg-transparent text-zinc-50 flex flex-col items-center", "login-form")}>
      <HypertextLogo className="self-start mb-4" width="60" height="60"/>
      <h2 className="text-3xl text-[#193468] font-bold transition-transform duration-300 ease-in-out self-start hover:translate-y-[-10px] hover:text-yellow-400 mb-10">Welcome back!</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <div className="mb-4">
          <label htmlFor="identifier" className="mb-1 text-[#193468]">Email or Username</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={handleIdentifierChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 text-[#193468]">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <button type="submit" className="text-xs bg-gradient-to-r from-secondary to-primary p-1 px-4 rounded-lg md:text-base text-white hover:opacity-65 focus:outline-none items-center text-center justify-start mt-10 h-11">Log In</button>
        <div className="flex justify-center space-x-2 mt-8">
          <div className="text-black font-bold">Don't have an account? </div><div className="text-blue-500 hover:text-blue-700 font-semibold ml-1 cursor-pointer" onClick={onSwitchToRegister}>Sign Up Here</div>
        </div>
      </form>
    </div>
  );
};
