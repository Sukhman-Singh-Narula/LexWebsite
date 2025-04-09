import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, selectAuthLoading, selectAuthError, clearError } from '../features/auth/authSlice';
import { AppDispatch } from '../store';
import { Shield } from 'lucide-react';

interface LoginPageProps {
  darkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ darkMode }) => {
  // State for form inputs
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get auth state from Redux store
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dispatch the login action
      await dispatch(login(credentials)).unwrap();

      // After successful login, navigate to home
      // Add a console.log here to debug
      console.log('Login successful, navigating to home');
      navigate('/');
    } catch (err) {
      // Log the error to see what's happening
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`p-8 rounded-lg shadow-md w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className="flex justify-center mb-6">
          <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <Shield size={40} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'
          }`}>Sign in to LexAI</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className={`block font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Email
            </label>
            <input
              type="email"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                }`}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className={`block font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Password
              </label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-700">
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                }`}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : ''
                  }`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className={`mt-8 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;