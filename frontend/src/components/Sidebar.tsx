import React, { useMemo } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Hash, Users, FolderKanban, LogOut, User } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const Sidebar: React.FC = () => {
  const { signOut } = useAuthContext();
  const { activeChannel, subscribeChannel, subscribeDirect, messages } = useChat();
  const channels = useMemo(() => [
    { name: 'general', label: 'General', icon: Hash },
    { name: 'team', label: 'Team', icon: Users },
    { name: 'projects', label: 'Projects', icon: FolderKanban },
  ], []);
  // Collect users from messages (excluding self)
  const users = useMemo(() => {
    const userSet = new Set<string>();
    messages.forEach(msg => {
      if (msg.sender && !channels.some(c => c.name === msg.sender)) {
        userSet.add(msg.sender);
      }
    });
    return Array.from(userSet);
  }, [messages, channels]);

  return (
    <nav className="hidden h-full w-64 flex-col border-r border-gray-200 bg-gray-50 p-4 md:flex">
      <div className="flex-grow">
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
          Channels
        </h2>
        <div className="flex flex-col gap-1">
          {channels.map((channel) => {
            const isActive = activeChannel.type === 'channel' && activeChannel.name === channel.name;
            return (
              <button
                key={channel.name}
                onClick={() => subscribeChannel(channel.name)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <channel.icon className="h-4 w-4" />
                <span>{channel.label}</span>
              </button>
            );
          })}
        </div>
        <h2 className="mt-6 mb-2 px-2 text-xs font-semibold uppercase text-gray-400">
          Users
        </h2>
        <div className="flex flex-col gap-1">
          {users.map((user) => {
            const isActive = activeChannel.type === 'dm' && activeChannel.name === user;
            return (
              <button
                key={user}
                onClick={() => subscribeDirect(user)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <User className="h-4 w-4" />
                <span>{user}</span>
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
