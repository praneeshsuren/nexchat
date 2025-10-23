import React from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { state, signOut } = useAuthContext();
  const userName = state?.displayName || state?.username || 'User';

  return (
    <header className="flex h-16 w-full flex-shrink-0 items-center justify-between bg-white px-4 shadow-sm sm:px-6 z-10">
      <div className="text-2xl font-bold text-blue-600">NexChat</div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Welcome, {userName}
        </span>
        <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
