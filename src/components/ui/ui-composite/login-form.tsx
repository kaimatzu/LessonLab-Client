// components/LoginForm.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <div className={cn("w-[450px] h-fit mx-auto p-5 border border-gray-600 rounded-lg bg-gray-800 text-white flex flex-col items-center", "login-form")}>
      <Image src={icon} alt="LessonLab Icon" className="w-16 h-16 mb-4" />
      <h2 className="text-2xl font-semibold transition-transform duration-300 ease-in-out text-center hover:translate-y-[-10px] hover:text-yellow-400">Welcome back!<br/>Log in to continue.</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <div className="mb-4">
          <label htmlFor="username" className="mb-1 text-xs">Username/Email:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 text-xs">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <div className="flex justify-center space-x-4">
          <button type="submit" className="px-4 py-2 text-lg rounded bg-yellow-400 text-white hover:bg-yellow-500">Login</button>
          <button type="button" className="px-4 py-2 text-lg rounded bg-gray-900 border border-yellow-400 text-white hover:bg-yellow-500 hover:border-yellow-500" onClick={onSwitchToSignUp}>Sign-up</button>
        </div>
      </form>
    </div>
  );
};
