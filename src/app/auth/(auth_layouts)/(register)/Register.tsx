"use client"

import React from 'react';
import Overlay from "@/components/ui/ui-base/overlay";
import SignUpForm from '@/components/ui/ui-composite/signup-form';

interface SignupPageProps {
    switchForm: () => void;
}

export default function SignupPage({ switchForm }: SignupPageProps) {

    return (
      <Overlay isOpen={true} onClose={() => {}} overlayName={"Register"} closable={false}>
        <div className="p-4">
          <SignUpForm onSwitchToLogin={switchForm} />
        </div>
      </Overlay>
    );
}