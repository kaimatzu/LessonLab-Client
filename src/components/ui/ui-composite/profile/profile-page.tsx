import React, { useState } from 'react';

interface ProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string };
}

export const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ isOpen, onClose, user }) => {
  const [username, setUsername] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black bg-opacity-50 flex justify-center items-center">
      {/* <div className="bg-white dark:bg-zinc-800 w-full max-w-7xl p-6 rounded-lg shadow-lg"> */}
      <div className="bg-white dark:bg-zinc-800 w-full max-w-5xl md:max-w-7xl p-8 md:p-6 rounded-lg shadow-lg">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">User Profile</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 dark:text-gray-300">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-left">
          <label className="text-gray-600 dark:text-gray-300 mt-2">Avatar</label>
            <div className="w-16 h-16 bg-gray-300 rounded-full flex justify-center items-center text-3xl text-gray-700">
              👤
            </div>
            
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-600 dark:text-gray-300 text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
               className="w-1/2 mt-1 px-4 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-600 dark:text-gray-300 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-1/2 mt-1 px-4 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-gray-600 dark:text-gray-300 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a new password"
              className="w-1/2 mt-1 px-4 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-600 dark:text-gray-300 text-sm">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-1/2 mt-1 px-4 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => alert('Profile saved!')}
            className="bg-gradient-to-r from-[#9AADEC] to-[#5E77D3] text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Save
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverlay;
