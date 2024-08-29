// components/LoginForm.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import login from '@/assets/login.jpg'
import { Input } from '../../ui-base/input';
import { Button } from '../../ui-base/button';
import { Label } from '../../ui-base/label';
import Link from 'next/link';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  handleSubmit: (e: React.SyntheticEvent) => any;
}

export default function LoginForm({ onSwitchToRegister, handleSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // TODO: Add logo in `Image`
  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] text-zinc-950">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold text-zinc-50">Login</h1>
              <p className="text-balance text-white/70">
                Enter your username or email below to login to your account
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username/Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={handleIdentifierChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={handlePasswordChange} />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-amber-300">
                Login
              </Button>
              <Button type='button' variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="#" className="underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden bg-muted lg:block rounded-lg">
          <Image
            src={login}
            alt="Logo"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-lg"
          />
        </div>
      </div>
    </form>
    // <div className={cn("w-[450px] h-fit mx-auto p-5 border border-zinc-50/10 rounded-lg bg-zinc-900 text-zinc-50 flex flex-col items-center", "login-form")}>
    //   <Image src={icon} alt="LessonLab Icon" className="w-16 h-16 mb-4" />
    //   <h2 className="text-2xl font-semibold transition-transform duration-300 ease-in-out text-center hover:translate-y-[-10px] hover:text-yellow-400">Welcome back!<br />Log in to continue.</h2>
    //   <form onSubmit={handleSubmit} className="flex flex-col w-full">
    //     <div className="mb-4">
    //       <Label htmlFor="identifier" className="mb-1 text-xs">Username/Email:</Label>
    //       <Input
    //         type="text"
    //         id="identifier"
    //         value={identifier}
    //         onChange={handleIdentifierChange}
    //         className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
    //         required
    //       />
    //     </div>
    //     <div className="mb-4">
    //       <Label htmlFor="password" className="mb-1 text-xs">Password:</Label>
    //       <Input
    //         type="password"
    //         id="password"
    //         value={password}
    //         onChange={handlePasswordChange}
    //         className="w-full p-2 text-lg text-black rounded border border-gray-300 box-border hover:border-yellow-400 focus:border-yellow-400 focus:outline-none"
    //         required
    //       />
    //     </div>
    //     <div className="flex justify-center space-x-4">
    //       <Button type="submit" className="px-4 py-2 text-lg rounded bg-yellow-400 text-white hover:bg-yellow-500">Login</Button>
    //       <Button type="button" className="px-4 py-2 text-lg rounded bg-zinc-950 border border-yellow-400/60 text-white hover:bg-yellow-500 hover:border-yellow-500" onClick={onSwitchToRegister}>Sign-up</Button>
    //     </div>
    //   </form>
    // </div>
  );
};
