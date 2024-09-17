import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import HypertextLogo from '@/assets/hypertext-logo';

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
    <div className={cn("w-fit h-fit mx-auto p-5 rounded-lg bg-transparent text-zinc-50 flex flex-col items-center")}>
      <HypertextLogo className="self-start mb-4" width="60" height="60"/>
      <h2 className="text-3xl text-[#193468] font-bold transition-transform duration-300 ease-in-out self-start hover:translate-y-[-10px] hover:text-[#5E77D3] mb-10">Create an account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <div className="mb-4">
          <label htmlFor="username" className="mb-1 text-[#193468]">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="mb-1 text-[#193468]">Email</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 text-[#193468]">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
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
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="mb-1 text-[#193468]">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="userType" className="mb-1 text-[#193468]">Register as</label>
          <select
            id="userType"
            value={userType}
            onChange={handleUserTypeChange}
            className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-[#5E77D3] focus:border-[#5E77D3] focus:outline-none"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <button type="submit" className="text-[#193468] bg-gradient-to-r from-secondary to-primary p-1 px-4 rounded-lg md:text-base text-white hover:opacity-65 focus:outline-none items-center text-center justify-start mt-10 h-11">Sign Up</button>
        <div className="flex justify-center space-x-2 mt-8">
          <div className="text-black font-bold">Already have an account? </div><div className="text-blue-500 hover:text-blue-700 font-semibold ml-1 cursor-pointer" onClick={onSwitchToLogin}>Log In Here</div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
