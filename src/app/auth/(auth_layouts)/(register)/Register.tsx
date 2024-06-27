"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Overlay from "@/components/ui/ui-base/overlay";
import RegisterForm from "@/components/ui/ui-composite/register-form";
import { useUserContext } from "@/lib/hooks/context-providers/user-context";
import { POST as register } from "@/app/api/auth/register/route";
import RequestBuilder from "@/lib/hooks/builders/request-builder";

interface RegisterPageProps {
  switchForm: () => void;
}

export default function RegisterPage({ switchForm }: RegisterPageProps) {
  const { setUser } = useUserContext();
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
      userType: { value: string };
      name: { value: string };
      email: { value: string };
    };
    const username = target.username.value;
    const password = target.password.value;
    const userType = target.userType.value;
    const name = target.name.value;
    const email = target.email.value;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("userType", userType);
    formData.append("name", name);
    formData.append("email", email);

    console.log("Page: ", username, password, userType, name, email);

    const requestBuilder = new RequestBuilder().setBody(formData);

    try {
      const response = await register(requestBuilder);
      if (response.ok) {
        const responseData = await response.json();
        console.log("User registered successfully:", responseData);
        setUser(responseData.user); // Set the user data in context
        router.push('/workspace');
      } else {
        const errorData = await response.json();
        console.error("Failed to register:", errorData);
        // Handle registration error (e.g., display error message to the user)
      }
    } catch (error) {
      console.error("Error registering:", error);
      // Handle unexpected error
    }
  };

  return (
    <Overlay isOpen={true} onClose={() => { }} overlayName={"Register"} closable={false}>
      <div className="pt-4">
        <RegisterForm onSwitchToLogin={switchForm} handleSubmit={handleSubmit} />
      </div>
    </Overlay>
  );
}
