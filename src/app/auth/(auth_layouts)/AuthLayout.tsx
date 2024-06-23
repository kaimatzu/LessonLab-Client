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
    <div>
      {isLoginForm ? <LoginPage switchForm={switchForm} /> : <RegisterPage switchForm={switchForm} />}
    </div>
  );
}