import React, { useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Hash, Users, FolderKanban, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { signOut } = useAuthContext();
  const [activeChannel, setActiveChannel] = useState('General');

  const channels = [
    { name: 'General', icon: Hash },
    { name: 'Team', icon: Users },
    { name: 'Projects', icon: FolderKanban },
  ];

  return (
    <nav className="hidden h-full w-64 flex-col border-r border-gray-200 bg-gray-50 p-4 md:flex">
      <div className="flex-grow">
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
          Channels
        </h2>
        <div className="flex flex-col gap-1">
          {channels.map((channel) => {
            const isActive = channel.name === activeChannel;
            return (
              <button
                key={channel.name}
                onClick={() => setActiveChannel(channel.name)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <channel.icon className="h-4 w-4" />
                <span>{channel.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
