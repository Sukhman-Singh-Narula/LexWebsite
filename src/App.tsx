import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CaseGrid from './components/CaseGrid';
import Calendar from './pages/Calendar';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/calendar':
        return 'Calendar';
      case '/account':
        return 'Account';
      case '/settings':
        return 'Settings';
      case '/tasks':
        return 'Tasks';
      case '/documents':
        return 'Documents';
      case '/cases':
        return 'My Cases';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 
      ${darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-[#f8f4f1] via-white to-[#f3e8e2]'}`}
    >
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Navbar 
          pageTitle={getPageTitle()} 
          darkMode={darkMode} 
          onDarkModeToggle={() => setDarkMode(!darkMode)}
        />
        <main className={`mt-16 p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<CaseGrid darkMode={darkMode} />} />
              <Route path="/cases" element={<CaseGrid darkMode={darkMode} />} />
              <Route path="/calendar" element={<Calendar darkMode={darkMode} />} />
              <Route path="/account" element={<Account darkMode={darkMode} />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} />} />
              <Route path="/tasks" element={<Tasks darkMode={darkMode} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;