"use client"

import React, { useState } from 'react';
import LoginPage from './(login)/Login';
import RegisterPage from './(register)/Register';

export default function AuthLayout() {
  const [isLoginForm, setIsLoginForm] = useState(true);

  const switchForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div className='bg-zinc-50 rounded-lg shadow-2xl overflow-visible'>
      {isLoginForm ? <LoginPage switchForm={switchForm} /> : <RegisterPage switchForm={switchForm} />}
    </div>
  );
}