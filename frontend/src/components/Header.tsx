import React from "react";
import { useAuthContext } from '@asgardeo/auth-react';

const Header: React.FC = () => {

    const { signOut } = useAuthContext();

  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow">
      <h1 className="text-2xl font-bold tracking-wide">NexChat</h1>
      <div className="flex items-center gap-4">
        {/* User info and logout button placeholder */}
        <span className="font-medium">User</span>
        <button className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition" onClick={() => signOut()}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
