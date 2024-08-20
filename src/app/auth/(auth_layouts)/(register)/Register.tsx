"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Overlay from "@/components/ui/ui-base/overlay";
import RegisterForm from "@/components/ui/ui-composite/auth/register-form";
import { registerUser } from '@/redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useSocket } from '@/lib/hooks/useSocket';

interface RegisterPageProps {
  switchForm: () => void;
}

export default function RegisterPage({ switchForm }: RegisterPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);
  const {
    connectSocket,
  } = useSocket();
  
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
      userType: { value: string };
      name: { value: string };
      email: { value: string };
    };
    const formData = new FormData();
    formData.append("username", target.username.value);
    formData.append("password", target.password.value);
    formData.append("userType", target.userType.value);
    formData.append("name", target.name.value);
    formData.append("email", target.email.value);

    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      connectSocket();
      router.push('/workspace');
    } else {
      // Handle registration error (e.g., display error message to the user)
      console.error("Registration failed");
    }
  };

  return (
    <Overlay isOpen={true} onClose={() => { }} overlayName={"Register"} overlayType="auth">
      <div className="pt-4">
        <RegisterForm onSwitchToLogin={switchForm} handleSubmit={handleSubmit} />
        {loading && <p>Loading...</p>}
        {/*error && <p>{error}</p>*/}
      </div>
    </Overlay>
  );
}
