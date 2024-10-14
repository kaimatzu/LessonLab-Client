"use client";

import React, { useEffect, useState } from 'react';
import LoginPage from './(login)/Login';
import RegisterPage from './(register)/Register';

export default function AuthLayout() {
  const [isLoginForm, setIsLoginForm] = useState(true);

  useEffect(() => {
    // Get the 'mode' query parameter from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');

    // Set the initial state based on the 'mode' value
    setIsLoginForm(mode === 'login');
  }, []); // Run only once on mount

  const switchForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div>
      {isLoginForm ? (
        <LoginPage switchForm={switchForm} />
      ) : (
        <RegisterPage switchForm={switchForm} />
      )}
    </div>
  );
}
