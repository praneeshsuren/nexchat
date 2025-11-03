import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { state, signOut, getBasicUserInfo } = useAuthContext();
  const [profileName, setProfileName] = useState<string>('User');
  const API_BASE = 'http://localhost:8081';

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        if (!state?.isAuthenticated) {
          setProfileName('User');
          return;
        }
        const info = (await getBasicUserInfo()) as Record<string, unknown>;
        // Helper to safely extract a string claim
        const s = (v: unknown) => (typeof v === 'string' && v.trim().length > 0 ? v : undefined);
        // Prefer given + family name; fallback to displayName; then username
        const given = s(info?.['given_name']) ?? s(info?.['givenName']);
        const family = s(info?.['family_name']) ?? s(info?.['familyName']);
        const full = [given, family].filter(Boolean).join(' ').trim();
        const display = s(info?.['name']) ?? s(info?.['displayName']) ?? s(state?.displayName) ?? s(state?.username);
        let name: string = full || display || 'User';
        // If name looks like an email, try to map via /api/users to get proper given/family
        const looksLikeEmail = (v: string) => v.includes('@');
        const normalize = (u: string) => u.includes('/') ? u.substring(u.lastIndexOf('/') + 1) : u;
        if (looksLikeEmail(name) && state?.username) {
          // Retry/backoff helper
          type UserSummary = { userName: string; givenName?: string; familyName?: string; displayName?: string };
          const fetchWithRetry = async (attempt = 1): Promise<UserSummary[] | null> => {
            try {
              const res = await fetch(`${API_BASE}/api/users`);
              if (!res.ok) return null;
              return (await res.json()) as UserSummary[];
            } catch {
              if (attempt < 4) {
                await new Promise(r => setTimeout(r, attempt * 400));
                return fetchWithRetry(attempt + 1);
              }
              return null;
            }
          };
          const list = await fetchWithRetry();
          if (list && Array.isArray(list)) {
            const me = list.find((u) => normalize(String(u.userName || '')) === normalize(String(state.username)));
            const gn = s(me?.givenName);
            const fn = s(me?.familyName);
            const dn = s(me?.displayName);
            const apiName = [gn, fn].filter(Boolean).join(' ').trim() || dn || '';
            if (apiName) name = apiName;
          }
        }
        if (isMounted) setProfileName(name);
      } catch {
        if (isMounted) setProfileName(state?.displayName || state?.username || 'User');
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [state?.isAuthenticated, state?.displayName, state?.username, getBasicUserInfo]);

  return (
  <header className="flex h-16 w-full shrink-0 items-center justify-between bg-white px-4 shadow-sm sm:px-6 z-10">
      <div className="text-2xl font-bold text-blue-600">NexChat</div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Welcome, {profileName}
        </span>
        <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
          {profileName.charAt(0).toUpperCase()}
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
