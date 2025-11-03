import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Hash, Users, FolderKanban, LogOut, User } from 'lucide-react';
import { useChat } from '../hooks/useChat';
const API_BASE = 'http://localhost:8081';

type UserSummary = {
  userName: string;
  givenName?: string;
  familyName?: string;
  displayName?: string;
};

const Sidebar: React.FC = () => {
  const { state, signOut } = useAuthContext();
  const { activeChannel, subscribeChannel, subscribeDirect } = useChat();
  const currentUserName = state?.username;
  const channels = useMemo(() => [
    { name: 'general', label: 'General', icon: Hash },
    { name: 'team', label: 'Team', icon: Users },
    { name: 'projects', label: 'Projects', icon: FolderKanban },
  ], []);
  // Fetch users from backend and show names
  const [users, setUsers] = useState<UserSummary[]>([]);
  useEffect(() => {
    let isMounted = true;
    const fetchWithRetry = async (attempt = 1): Promise<UserSummary[] | null> => {
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) return null;
        return (await res.json()) as UserSummary[];
      } catch (e) {
        if (attempt < 5) {
          await new Promise(r => setTimeout(r, attempt * 500));
          return fetchWithRetry(attempt + 1);
        }
        console.error('Failed to fetch users after retries', e);
        return null;
      }
    };
    const loadUsers = async () => {
      try {
        const data = await fetchWithRetry();
        if (isMounted && data) {
          // De-duplicate current user and ensure they appear only once
          const norm = (s: string) => (s.includes('/') ? s.substring(s.lastIndexOf('/') + 1) : s);
          const me = currentUserName ? norm(currentUserName) : undefined;
          const filtered = data.filter(u => !me || norm(u.userName) !== me);
          // Re-add current user at the top, with name label resolved
          if (me) {
            const mine = data.find(u => norm(u.userName) === me);
            if (mine) filtered.unshift(mine);
          }
          setUsers(filtered);
        }
      } catch (e) {
        console.error('Failed to fetch users', e);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, [currentUserName]);

  return (
    <nav className="hidden h-full w-64 flex-col border-r border-gray-200 bg-gray-50 p-4 md:flex">
  <div className="grow">
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
        <h2 className="mt-6 mb-2 px-2 text-xs font-semibold uppercase text-gray-400">Users</h2>
        <div className="flex flex-col gap-1">
          {users.map((u) => {
            const nameLabel = `${u.givenName ?? ''} ${u.familyName ?? ''}`.trim();
            const label = nameLabel || u.displayName || u.userName;
            const isActive = activeChannel.type === 'dm' && activeChannel.name === u.userName;
            const isCurrent = currentUserName && u.userName === currentUserName;
            return (
              <button
                key={u.userName}
                onClick={() => subscribeDirect(u.userName, label)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : isCurrent
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <User className="h-4 w-4" />
                <span>{label}{isCurrent ? ' (You)' : ''}</span>
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
