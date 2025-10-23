import React from "react";

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-100 w-64 p-4 border-r border-gray-200 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Chats</h2>
      <ul className="space-y-2">
        {/* Placeholder for chat rooms/contacts */}
        <li className="p-2 rounded hover:bg-gray-200 cursor-pointer">General</li>
        <li className="p-2 rounded hover:bg-gray-200 cursor-pointer">Support</li>
        <li className="p-2 rounded hover:bg-gray-200 cursor-pointer">Random</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
