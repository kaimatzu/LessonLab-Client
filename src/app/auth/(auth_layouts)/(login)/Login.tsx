"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Overlay from "@/components/ui/ui-base/overlay";
import LoginForm from '@/components/ui/ui-composite/auth/login-form';
import { loginUser } from '@/redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

interface LoginPageProps {
  switchForm: () => void;
}

export default function LoginPage({ switchForm }: LoginPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      identifier: { value: string };
      password: { value: string };
    };
    const formData = new FormData();
    formData.append("identifier", target.identifier.value);
    formData.append("password", target.password.value);

    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      router.push('/workspace');
    } else {
      // Handle login error (e.g., display error message to the user)
      console.error("Login failed");
    }
  };

  return (
    <Overlay isOpen={true} onClose={() => { }} overlayName={"Login"} closable={false}>
      <div className="pt-4">
        <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
      </div>
    </Overlay>
  );
}
