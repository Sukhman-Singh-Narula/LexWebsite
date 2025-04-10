import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { Client, selectCreateClientLoading, selectUpdateClientLoading } from '../features/clients/clientSlice';
import { createClient, updateClient } from '../features/clients/clientSlice';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientData?: Client;
    darkMode: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, clientData, darkMode }) => {
    const dispatch = useDispatch<AppDispatch>();
    const createLoading = useSelector(selectCreateClientLoading);
    const updateLoading = useSelector(selectUpdateClientLoading);
    const loading = createLoading || updateLoading;
    const [error, setError] = useState<string | null>(null);

    // Initial form state
    const initialFormState = {
        email: '',
        full_name: '',
        phone: '',
        company_name: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'US'
        }
    };

    const [formData, setFormData] = useState(initialFormState);

    // Reset the form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (clientData) {
                // Edit mode - populate form with client data
                setFormData({
                    email: clientData.email || '',
                    full_name: clientData.full_name || '',
                    phone: clientData.phone || '',
                    company_name: clientData.company_name || '',
                    address: clientData.address || {
                        street: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: 'US'
                    }
                });
            } else {
                // Create mode - start with empty form
                setFormData(initialFormState);
            }
            // Clear any errors
            setError(null);
        }
    }, [clientData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Check if this is an address field
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (clientData) {
                // Update existing client
                await dispatch(updateClient({
                    id: clientData.id,
                    data: {
                        email: formData.email,
                        full_name: formData.full_name,
                        phone: formData.phone,
                        company_name: formData.company_name,
                        address: formData.address
                    }
                })).unwrap();
            } else {
                // Create new client
                await dispatch(createClient({
                    email: formData.email,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    company_name: formData.company_name,
                    address: formData.address
                })).unwrap();
            }
            onClose();
        } catch (error: any) {
            console.error('Failed to save client:', error);

            // Try to extract a meaningful error message
            let errorMessage = 'An error occurred while saving the client';

            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.detail) {
                errorMessage = error.detail;
            } else if (error?.data?.detail) {
                errorMessage = error.data.detail;
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-md transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'
                }`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {clientData ? 'Edit Client' : 'Create New Client'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded hover:bg-opacity-10 ${darkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Full Name*
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Email*
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Company Name
                        </label>
                        <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Address
                        </label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address?.street || ''}
                                onChange={handleChange}
                                placeholder="Street"
                                className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'border-gray-300'
                                    }`}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address?.city || ''}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                        }`}
                                />
                                <input
                                    type="text"
                                    name="address.state"
                                    value={formData.address?.state || ''}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    name="address.zip"
                                    value={formData.address?.zip || ''}
                                    onChange={handleChange}
                                    placeholder="Zip Code"
                                    className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                        }`}
                                />
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address?.country || 'US'}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Client'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;