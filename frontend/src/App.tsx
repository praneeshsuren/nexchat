import React from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { ChatProvider } from './context/ChatContext'; // Import the provider

// --- Your Enhanced App Component ---
function App() {
  const { state, signIn } = useAuthContext();

  if (!state.isAuthenticated) {
    // Login page (unchanged)
    return (
      <div className="flex min-h-screen w-full flex-col font-inter lg:flex-row">
        {/* Hero Section (Left Pane) */}
        <motion.div
          className="relative flex h-screen/2 lg:h-screen w-full flex-col items-center justify-center p-8 lg:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D&auto=format&fit=crop&w=1740&q=80"
              alt="Team collaboration"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://placehold.co/1000x1200/434190/FFFFFF?text=Chat+App&font=raleway';
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-purple-800/90"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-20 flex flex-col items-center text-center text-white lg:items-start lg:text-left">
            <svg
              className="mb-6 h-20 w-20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
              NexChat
            </h1>
            <p className="max-w-md text-xl text-blue-100 opacity-90">
              Connect, chat, and collaborate with your team in real-time. 
              All in one seamless workspace.
            </p>
          </div>
        </motion.div>

        {/* Login Section (Right Pane) */}
        <motion.div
          className="flex w-full flex-col items-center justify-center bg-white p-12 lg:h-screen lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-10 text-center text-lg">
              Sign in to join the conversation.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 font-semibold text-lg"
              onClick={() => signIn()}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"
                ></path>
              </svg>
              Sign In with Asgardeo
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-400 text-sm mt-12"
            >
              &copy; {new Date().getFullYear()} NexChat. All rights reserved.
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated App View
  // Wrap the chat UI in the ChatProvider
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 h-full overflow-y-auto">
            {/* ChatWindow no longer needs props passed down */}
            <ChatWindow />
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}

export default App;
