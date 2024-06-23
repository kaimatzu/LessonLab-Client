import React, { useState } from 'react';
import Image from 'next/image';
import icon from '@/assets/icon.png';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  handleSubmit: (e: React.SyntheticEvent) => any;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, handleSubmit }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('teacher');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(e.target.value);
  };

  return (
    <div className={cn("w-[450px] h-fit mx-auto p-5 border border-zinc-50/10 rounded-lg bg-zinc-900 text-zinc-50 flex flex-col items-center")}>
      <Image src={icon} alt="LessonLab Icon" className="w-16 h-16 mb-4" />
      <h2 className="text-2xl font-semibold transition-transform duration-300 ease-in-out text-center hover:translate-y-[-10px] hover:text-yellow-400">Join us now and get started!</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <div className="mb-4">
          <label htmlFor="username" className="mb-1 text-xs">Username:</label>
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
          <label htmlFor="email" className="mb-1 text-xs">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 text-xs">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
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
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="mb-1 text-xs">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="userType" className="mb-1 text-xs">Register as:</label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div className="flex justify-center space-x-4">
          <button type="button" className="px-4 py-2 text-lg rounded bg-zinc-950 border border-yellow-400/60 text-white hover:bg-yellow-500 hover:border-yellow-500" onClick={onSwitchToLogin}>Back</button>
          <button type="submit" className="px-4 py-2 text-lg rounded bg-yellow-400 text-white hover:bg-yellow-500">Confirm</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
