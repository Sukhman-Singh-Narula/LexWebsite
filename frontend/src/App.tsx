import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CaseGrid from './components/CaseGrid';
import Calendar from './pages/Calendar';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, logout } from './features/auth/authSlice';
import { AppDispatch } from './store';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
  };

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
      case '/login':
        return 'Login';
      case '/signup':
        return 'Sign Up';
      default:
        return 'Dashboard';
    }
  };

  // Render auth pages (login/signup) without sidebar/navbar when not authenticated
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // Render just the auth pages without sidebar/navbar when on login or signup
  if (isAuthPage) {
    return (
      <div className={`min-h-screen transition-colors duration-300 
        ${darkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-[#f8f4f1] via-white to-[#f3e8e2]'}`}
      >
        <Routes>
          <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
          <Route path="/signup" element={<SignupPage darkMode={darkMode} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // Render full app with sidebar when authenticated
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
        onLogout={handleLogout}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Navbar
          pageTitle={getPageTitle()}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          onLogout={handleLogout}
        />
        <main className={`mt-16 p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <CaseGrid darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute>
                    <CaseGrid darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks darkMode={darkMode} />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;