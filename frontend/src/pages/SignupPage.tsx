import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signup, selectSignupLoading, selectSignupError, selectSignupSuccess, clearSignupStatus, SignupData } from '../features/auth/authSlice';
import { AppDispatch } from '../store';

interface SignupPageProps {
    darkMode: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ darkMode }) => {
    // State for form inputs
    const [formData, setFormData] = useState<SignupData>({
        email: '',
        password: '',
        full_name: '',
        bar_number: '',
        license_state: '',
        phone: '',
        firm_name: ''
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);

    // Redux hooks
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get auth state from Redux store
    const loading = useSelector(selectSignupLoading);
    const error = useSelector(selectSignupError);
    const success = useSelector(selectSignupSuccess);

    // Check if passwords match when either password field changes
    useEffect(() => {
        if (formData.password && confirmPassword) {
            setPasswordMatch(formData.password === confirmPassword);
        } else {
            setPasswordMatch(true);
        }
    }, [formData.password, confirmPassword]);

    // Redirect to login page after successful signup
    useEffect(() => {
        if (success) {
            // Add a slight delay to show success message
            const timer = setTimeout(() => {
                dispatch(clearSignupStatus());
                navigate('/login');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [success, navigate, dispatch]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== confirmPassword) {
            setPasswordMatch(false);
            return;
        }

        dispatch(signup(formData));
    };

    // US states list for license_state dropdown
    const usStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
        'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
        'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className={`p-8 rounded-lg shadow-md w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>Sign Up for LexAI</h2>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                        <span className="block sm:inline">Account created successfully! Redirecting to login...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Email*
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="full_name" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Full Name*
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    }`}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bar_number" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Bar Number*
                                </label>
                                <input
                                    type="text"
                                    id="bar_number"
                                    name="bar_number"
                                    value={formData.bar_number}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                        }`}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="license_state" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    License State*
                                </label>
                                <select
                                    id="license_state"
                                    name="license_state"
                                    value={formData.license_state}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                        }`}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {usStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    }`}
                            />
                        </div>

                        <div>
                            <label htmlFor="firm_name" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Law Firm Name
                            </label>
                            <input
                                type="text"
                                id="firm_name"
                                name="firm_name"
                                value={formData.firm_name}
                                onChange={handleChange}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    }`}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Password*
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    } ${!passwordMatch ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className={`block font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Confirm Password*
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-700'
                                    } ${!passwordMatch ? 'border-red-500' : ''}`}
                                required
                            />
                            {!passwordMatch && (
                                <p className="text-red-500 text-xs italic mt-1">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </div>

                    <div className={`mt-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;