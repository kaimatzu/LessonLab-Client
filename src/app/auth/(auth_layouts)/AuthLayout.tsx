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
    <div className='bg-gradient-to-l from-slate-900 to-indigo-600 rounded-lg shadow-indigo-600 shadow-2xl overflow-visible'>
      {isLoginForm ? <LoginPage switchForm={switchForm} /> : <RegisterPage switchForm={switchForm} />}
    </div>
  );
}