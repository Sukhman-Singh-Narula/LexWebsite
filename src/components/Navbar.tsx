import React, { useState } from 'react';
import { Search, Bell, User, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export default function Navbar({ pageTitle, darkMode, onDarkModeToggle }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New case assigned', time: '2 minutes ago' },
    { id: 2, message: 'Meeting reminder', time: '1 hour ago' },
    { id: 3, message: 'Document updated', time: '2 hours ago' },
  ];

  return (
    <div className={`h-16 flex items-center justify-between px-4 fixed top-0 right-0 left-64 z-10 backdrop-blur-sm transition-colors duration-300
      ${darkMode 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 border-gray-200'} border-b`}>
      <div className="flex items-center gap-4">
        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {pageTitle}
        </h1>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          LexAI
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cases, clients, or documents..."
            className={`w-full px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8c4b8] transition-all duration-300
              ${darkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400' 
                : 'bg-gray-50 text-gray-900'}`}
          />
          <Search className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onDarkModeToggle}
          className={`p-2 rounded-full transition-colors duration-300
            ${darkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button 
            className={`p-2 rounded-full relative transition-colors duration-300
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#e8c4b8] rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-2 z-50 transition-colors duration-300
              ${darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'} border`}>
              <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
              </div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 transition-colors duration-300
                    ${darkMode 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-50 text-gray-800'}`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {notification.time}
                  </p>
                </div>
              ))}
              <div className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button className="text-sm text-[#e8c4b8] hover:text-[#ddb3a7] font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className={`flex items-center gap-2 p-2 rounded-full transition-colors duration-300
              ${darkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
            onClick={() => setShowProfile(!showProfile)}
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-[#e8c4b8]"
            />
            <User size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          
          {showProfile && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50 transition-colors duration-300
              ${darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'} border`}>
              <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  john.doe@example.com
                </p>
              </div>
              <div className="py-1">
                <a 
                  href="/account" 
                  className={`block px-4 py-2 text-sm transition-colors duration-300
                    ${darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Profile
                </a>
                <a 
                  href="/settings" 
                  className={`block px-4 py-2 text-sm transition-colors duration-300
                    ${darkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Settings
                </a>
                <hr className={`my-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <button 
                  className={`block w-full text-left px-4 py-2 text-sm text-red-500 transition-colors duration-300
                    ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}