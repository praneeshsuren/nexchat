import { useAuthContext } from '@asgardeo/auth-react'; 

const Header = () => {
  // Get state and signOut function from the Asgardeo Auth Context
  const { state, signOut } = useAuthContext();

  // Determine the best name to display, with a fallback
  const userName = state?.displayName || state?.username || 'User';

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between bg-white px-4 shadow-sm sm:px-6 z-10">
      {/* App Title */}
      <div className="text-2xl font-bold text-blue-600">NexChat</div>
      
      {/* User Info and Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Welcome, {userName}
        </span>
        <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => signOut()} // This now calls the signOut function from the context
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100"
          title="Sign Out"
        >
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;