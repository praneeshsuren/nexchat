import { useState } from 'react';
import { Hash, User, ChevronDown, Plus } from 'lucide-react';

// Mock data for channels and DMs
const channels = [
  { id: 'c1', name: 'general' },
  { id: 'c2', name: 'development' },
  { id: 'c3', name: 'random' },
];

const directMessages = [
  { id: 'd1', name: 'Alice Smith' },
  { id: 'd2', name: 'Bob Johnson' },
  { id: 'd3', name: 'Charlie Brown' },
];

/**
 * Sidebar component displaying channels and direct messages.
 */
const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('c1'); // Default to #general

  return (
    <nav className="hidden h-full w-64 flex-shrink-0 flex-col overflow-y-auto bg-gray-800 text-gray-300 md:flex">
      <div className="flex-1 p-4">
        {/* Channels Section */}
        <div className="mb-6">
          <button className="flex w-full items-center justify-between text-sm font-semibold text-gray-400 hover:text-white">
            <span className="flex items-center gap-1">
              <ChevronDown className="h-4 w-4" />
              <span>Channels</span>
            </span>
            <Plus className="h-4 w-4 cursor-pointer hover:text-green-400" />
          </button>
          <ul className="mt-2 space-y-1">
            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href="#"
                  onClick={() => setActiveItem(channel.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-all ${
                    activeItem === channel.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <Hash className="h-4 w-4" />
                  <span>{channel.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Messages Section */}
        <div>
          <button className="flex w-full items-center justify-between text-sm font-semibold text-gray-400 hover:text-white">
            <span className="flex items-center gap-1">
              <ChevronDown className="h-4 w-4" />
              <span>Direct Messages</span>
            </span>
            <Plus className="h-4 w-4 cursor-pointer hover:text-green-400" />
          </button>
          <ul className="mt-2 space-y-1">
            {directMessages.map((dm) => (
              <li key={dm.id}>
                <a
                  href="#"
                  onClick={() => setActiveItem(dm.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-all ${
                    activeItem === dm.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    <User className="h-4 w-4" />
                  </span>
                  <span>{dm.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
