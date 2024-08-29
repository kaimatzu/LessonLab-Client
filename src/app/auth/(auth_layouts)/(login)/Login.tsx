"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/ui/ui-composite/auth/login-form';
import { loginUser } from '@/redux/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useToast } from '@/components/ui/ui-base/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui-base/card';
import { Button } from '@/components/ui/ui-base/button';
import { Input } from '@/components/ui/ui-base/input';
import { Label } from '@/components/ui/ui-base/label';
import Link from 'next/link';
import Image from 'next/image'

interface LoginPageProps {
  switchForm: () => void;
}

export default function LoginPage({ switchForm }: LoginPageProps) {
  const { toast } = useToast()
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAppSelector((state) => state.user.loading);
  // NOTE: On the first user not found login fail this value is null but on the successive login fails it will have value { message: "User not found" }
  const error = useAppSelector((state) => state.user.error);

  // TODO: OAuth
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
      // console.log('---> error: ', error);
      // if (error)
      //   console.log('---> error.message: ', error.message)
      const msg = error && error.message ? error.message : 'Something went wrong.' // TODO: - Fixme: the `error` field in `UserState` type is of type string but somewhere this is assigned an object of type { message: string }
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive'
      })
    }
  };

  // <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
  return (
    <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
    // <Card className='mx-auto max-w-sm'>
    //   <CardHeader className='space-y-1'>
    //     <CardTitle className='text-2xl font-bold'>
    //       Login
    //     </CardTitle>
    //     <CardDescription>Enter your email or username and password to login to your account</CardDescription>
    //   </CardHeader>
    //   <CardContent>
    //     <div className="space-y-4">
    //       <div className="space-y-2">
    //         <Label htmlFor="email">Email</Label>
    //         <Input id="email" type="email" placeholder="m@example.com" required />
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="password">Password</Label>
    //         <Input id="password" type="password" required />
    //       </div>
    //       <Button type="submit" className="w-full shadow-yellow-400/10 shadow-xl hover:translate-y-1 hover:translate-x-1 transition-transform duration-[450ms]">
    //         Login
    //       </Button>
    //     </div>
    //     {/* <div className='flex gap-8'>
    //       <Button>Login</Button>
    //       <Button variant={'secondary'}>Create Account</Button>
    //     </div> */}
    //   </CardContent>
    // </Card>
    // <Overlay isOpen={true} onClose={() => { }} overlayName={"Login"} overlayType="auth" className='bg-transparent'>
    //   <div className="pt-4">
    //     <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
    //     {loading && <p>Loading...</p>}
    //   </div>
    // </Overlay>
  );
}
