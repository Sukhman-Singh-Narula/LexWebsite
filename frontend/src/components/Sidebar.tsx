import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlignJustify as LawJustice,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: Briefcase, label: 'My Cases', path: '/cases' },
  { icon: Users, label: 'Clients', path: '/clients' }, // Add this line
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Users, label: 'Account', path: '/account' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  darkMode: boolean;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onToggle, darkMode, onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={`fixed left-0 top-0 h-screen transition-all duration-300 z-20
        ${darkMode
          ? 'bg-gray-800 text-white'
          : 'bg-[#e8c4b8] text-gray-900'}
        ${isOpen ? 'w-64' : 'w-16'}`}
    >
      <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300
        ${darkMode ? 'border-gray-700' : 'border-[#ddb3a7]'}`}>
        {isOpen ? (
          <span className={`text-xl font-semibold transition-colors duration-300
            ${darkMode
              ? 'text-white'
              : 'text-gray-900'}`}>
            LexAI
          </span>
        ) : (
          <div className="flex justify-center w-full">
            <LawJustice size={24} className={`${darkMode ? 'text-white' : 'text-gray-900'}`} />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-colors duration-300
            ${darkMode
              ? 'hover:bg-gray-700'
              : 'hover:bg-[#ddb3a7]'}`}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="p-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/' && location.pathname === '') ||
            (item.path === '/cases' && location.pathname === '/cases');
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 p-3 my-1 rounded-lg transition-all duration-200 group relative
                ${isActive
                  ? darkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-[#ddb3a7] text-gray-900'
                  : darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-800 hover:bg-[#ddb3a7] hover:text-gray-900'}`}
            >
              <item.icon size={20} />
              {isOpen && <span>{item.label}</span>}

              {!isOpen && (
                <div className={`absolute left-16 px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                  ${darkMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 shadow-lg'}`}>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className={`flex items-center gap-4 p-3 my-1 rounded-lg transition-all duration-200 group relative w-full
            ${darkMode
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-800 hover:bg-[#ddb3a7] hover:text-gray-900'}`}
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}

          {!isOpen && (
            <div className={`absolute left-16 px-2 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
              ${darkMode
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-900 shadow-lg'}`}>
              Logout
            </div>
          )}
        </button>
      </nav>

      {isOpen && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-300
          ${darkMode ? 'border-gray-700' : 'border-[#ddb3a7]'}`}>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#ddb3a7]"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                John Doe
              </p>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Senior Attorney
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}