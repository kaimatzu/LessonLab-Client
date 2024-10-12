"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Overlay from "@/components/ui/ui-base/overlay";
import LoginForm from '@/components/ui/ui-composite/auth/login-form';
import { loginUser } from '@/redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useToast } from '@/components/ui/ui-base/use-toast';
import { useSocket } from '@/lib/hooks/useServerEvents';
import HypertextLoading from '@/assets/animated/hypertext-loading';

interface LoginPageProps {
  switchForm: () => void;
}
// #region Login Page
export default function LoginPage({ switchForm }: LoginPageProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector((state) => state.user.loading);
  const error = useAppSelector((state) => state.user.error);
  const {
    connectSocket,
  } = useSocket();

  // #region Handle Submit
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
      console.log("Login:", resultAction.payload.userId)
      connectSocket(resultAction.payload.userId);
      router.push('/workspace');
    } else {
      // Handle login error (e.g., display error message to the user)
      console.error("Login failed");
      toast({
        title: 'Error',
        description: resultAction ? resultAction.payload : 'Something went wrong.',
        variant: 'destructive'
      })
    }
  };

  // #region JSX
  return (
    <Overlay isOpen={true} onClose={() => { }} overlayName={"Login"} overlayType="auth">
      <div className="pt-4">
        <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
        {loading && <div className="flex w-full justify-center"><HypertextLoading progress={99} width={70} height={70}/></div>}
      </div>
    </Overlay>
  );
}
