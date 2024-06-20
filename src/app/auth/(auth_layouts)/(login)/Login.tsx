"use client"

import React from 'react';
import Overlay from "@/components/ui/ui-base/overlay";
import LoginForm from '@/components/ui/ui-composite/login-form';

interface LoginPageProps {
  switchForm: () => void;
}

export default function LoginPage({ switchForm }: LoginPageProps) {

    return (
      <Overlay isOpen={true} onClose={() => {}} overlayName={"Login"} closable={false}>
        <div className="p-4">
          <LoginForm onSwitchToSignUp={switchForm} />
        </div>
      </Overlay>
    );
}