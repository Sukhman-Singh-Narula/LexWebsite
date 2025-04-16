// src/components/CaseModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { Case, selectCreateCaseLoading, selectUpdateCaseLoading } from '../features/cases/caseSlices';
import { createCase, updateCase } from '../features/cases/caseActions';
import { fetchClients, selectClients, selectClientsLoading } from '../features/clients/clientSlice';

interface CaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseData?: Case;
    darkMode: boolean;
}

// Function to generate a unique case number
const generateCaseNumber = () => {
    return `CASE-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
};

const CaseModal: React.FC<CaseModalProps> = ({ isOpen, onClose, caseData, darkMode }) => {
    const dispatch = useDispatch<AppDispatch>();
    const createLoading = useSelector(selectCreateCaseLoading);
    const updateLoading = useSelector(selectUpdateCaseLoading);
    const loading = createLoading || updateLoading;
    const [error, setError] = useState<string | null>(null);

    // Get clients from store
    const clients = useSelector(selectClients);
    const clientsLoading = useSelector(selectClientsLoading);

    // Initial form state with auto-generated case number
    const initialFormState = {
        title: '',
        case_number: generateCaseNumber(),
        description: '',
        status: 'draft', // Important: Use lowercase
        client_id: '', // Will be populated from dropdown
        priority: 'Medium' as 'High' | 'Medium' | 'Low'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [clientValidationError, setClientValidationError] = useState(false);

    // Fetch clients when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchClients());
        }
    }, [isOpen, dispatch]);

    // Reset the form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (caseData) {
                setFormData({
                    title: caseData.title || '',
                    case_number: caseData.case_number || '',
                    description: caseData.description || '',
                    status: caseData.status || 'draft', // Use lowercase
                    client_id: caseData.client_id || '',
                    priority: caseData.priority || 'Medium'
                });
            } else {
                // Generate a new case number for new cases
                setFormData({
                    ...initialFormState,
                    case_number: generateCaseNumber(),
                    client_id: clients.length > 0 ? clients[0].id : '' // Set first client as default if available
                });
            }
            // Clear any errors
            setError(null);
            setClientValidationError(false);
        }
    }, [caseData, isOpen, clients]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear client validation error when user selects a client
        if (name === 'client_id' && clientValidationError) {
            setClientValidationError(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setClientValidationError(false);

        // Validate client selection
        if (!formData.client_id) {
            setClientValidationError(true);
            return;
        }

        try {
            // Log what we're about to send
            console.log('Submitting form data:', formData);

            if (caseData) {
                // Update existing case
                await dispatch(updateCase({
                    id: caseData.id,
                    data: {
                        title: formData.title,
                        description: formData.description,
                        status: formData.status,
                        // We don't update client_id for existing cases
                    }
                })).unwrap();
            } else {
                // Create new case
                console.log('Creating case with data:', {
                    title: formData.title,
                    case_number: formData.case_number,
                    description: formData.description,
                    client_id: formData.client_id,
                    status: formData.status
                });

                await dispatch(createCase({
                    title: formData.title,
                    case_number: formData.case_number,
                    description: formData.description,
                    client_id: formData.client_id,
                    status: formData.status,
                })).unwrap();
            }
            onClose();
        } catch (error: any) {
            console.error('Failed to save case:', error);

            // Try to extract a meaningful error message
            let errorMessage = 'An error occurred while saving the case';

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
                        {caseData ? 'Edit Case' : 'Create New Case'}
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
                    {/* Client Selection Dropdown */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Client*
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                            </div>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleChange}
                                className={`w-full pl-10 rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'border-gray-300'
                                    } ${clientValidationError ? 'border-red-500' : ''}`}
                                disabled={!!caseData} // Disable editing client for existing cases
                                required
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name} {client.company_name ? `(${client.company_name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {clientValidationError && (
                            <p className="text-red-500 text-xs mt-1">Please select a client</p>
                        )}
                        {clientsLoading && (
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Loading clients...
                            </p>
                        )}
                        {!clientsLoading && clients.length === 0 && (
                            <p className="text-yellow-500 text-xs mt-1">
                                No clients available. Please add a client first.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Case Title*
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
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
                            Case Number* (auto-generated)
                        </label>
                        <input
                            type="text"
                            name="case_number"
                            value={formData.case_number}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                            disabled={!!caseData} // Disable editing case number for existing cases
                            required
                        />
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Auto-generated for uniqueness
                        </p>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Priority
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className={`w-full rounded-md border px-3 py-2 transition-colors duration-300 ${darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'border-gray-300'
                                }`}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
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
                            disabled={loading || (clients.length === 0)}
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
                                'Save Case'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CaseModal;