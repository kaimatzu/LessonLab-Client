"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import Overlay from "@/components/ui/ui-base/overlay";
import LoginForm from '@/components/ui/ui-composite/login-form';
import { useUserContext } from '@/lib/hooks/user-context';
import { POST as loginPost } from '@/app/api/auth/login/route'

interface LoginPageProps {
  switchForm: () => void;
}

export default function LoginPage({ switchForm }: LoginPageProps) {
  const { setUser } = useUserContext();
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      identifier: { value: string };
      password: { value: string };
    };
    const identifier = target.identifier.value;
    const password = target.password.value;

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);


    console.log("Page: ", identifier, password);
    try {
      const request = new Request('', {
        method: 'POST',
        body: formData,
      });

      const response = await loginPost(request);
      if (response.ok) {
        const responseData = await response.json();
        console.log("User logged in successfully:", responseData);
        setUser(responseData.user); // Set the user data in context
        router.push('/workspace');

      } else {
        const errorData = await response.json();
        console.error("Failed to log in:", errorData);
        // Handle login error (e.g., display error message to the user)
      }
    } catch (error) {
      console.error("Error logging in:", error);
      // Handle unexpected error
    }
  };

  return (
    <Overlay isOpen={true} onClose={() => { }} overlayName={"Login"} closable={false}>
      <div className="pt-4">
        <LoginForm onSwitchToRegister={switchForm} handleSubmit={handleSubmit} />
      </div>
    </Overlay>
  );
}