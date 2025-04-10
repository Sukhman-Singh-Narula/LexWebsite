import React, { useState, useEffect } from 'react';
import { MoreVertical, Grid, List, RefreshCcw, PlusCircle, Edit, Trash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
    fetchClients,
    Client,
    selectClients,
    selectClientsLoading,
    selectClientsError,
    setSelectedClient
} from '../features/clients/clientSlice';
import ClientModal from './ClientModal';

interface ClientGridProps {
    darkMode: boolean;
}

export default function ClientGrid({ darkMode }: ClientGridProps) {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);

    const dispatch = useDispatch<AppDispatch>();

    // Select clients from Redux store using selectors
    const clients = useSelector(selectClients);
    const loading = useSelector(selectClientsLoading);
    const error = useSelector(selectClientsError);

    // Fetch clients on component mount
    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchClients());
    };

    const handleCreateClient = () => {
        setClientToEdit(undefined); // Make sure we're not in edit mode
        setIsModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setClientToEdit(client);
        setIsModalOpen(true);
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // You could add a toast notification here
                console.log('Copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Refresh the clients list after closing the modal
        dispatch(fetchClients());
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Safely get error message as string
    const getErrorMessage = () => {
        if (typeof error === 'string') {
            return error;
        } else if (error && typeof error === 'object') {
            if ('message' in error) return String(error.message);
            if ('detail' in error) return String(error.detail);

            // Convert error object to string
            try {
                return JSON.stringify(error);
            } catch (e) {
                return 'An error occurred while fetching clients';
            }
        }
        return 'An unknown error occurred';
    };

    return (
        <div className={`p-6 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Client Management
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manage your clients for case assignments
                </p>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Clients</h2>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleCreateClient}
                        className={`mr-2 px-3 py-2 rounded-md flex items-center gap-1 ${darkMode
                            ? 'bg-[#e8c4b8] text-gray-900 hover:bg-[#ddb3a7]'
                            : 'bg-[#e8c4b8] text-gray-900 hover:bg-[#ddb3a7]'
                            }`}
                    >
                        <PlusCircle size={16} />
                        <span>New Client</span>
                    </button>
                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded transition-colors duration-300 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                            } ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button
                        onClick={() => setViewType('grid')}
                        className={`p-2 rounded ${viewType === 'grid'
                            ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                    >
                        <Grid size={20} className={darkMode ? 'text-white' : 'text-gray-700'} />
                    </button>
                    <button
                        onClick={() => setViewType('list')}
                        className={`p-2 rounded ${viewType === 'list'
                            ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                    >
                        <List size={20} className={darkMode ? 'text-white' : 'text-gray-700'} />
                    </button>
                </div>
            </div>

            {loading && (
                <div className={`flex justify-center items-center py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mr-3"></div>
                    Loading clients...
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{getErrorMessage()}</p>
                    <button
                        className="underline ml-2"
                        onClick={handleRefresh}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && clients.length === 0 && (
                <div className={`bg-${darkMode ? 'gray-800' : 'white'} rounded-lg p-8 text-center shadow`}>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        No clients found
                    </h3>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        You don't have any clients yet. Create a new client to get started.
                    </p>
                </div>
            )}

            {!loading && !error && clients.length > 0 && (
                <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className={`rounded-lg border p-4 hover:shadow-lg transition-shadow ${darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {client.full_name}
                                </h3>
                                <div className="flex space-x-1">
                                    <button
                                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                                            }`}
                                        onClick={() => handleEditClient(client)}
                                        title="Edit client"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                                            }`}
                                        title="More options"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Client ID:
                                    <span
                                        className="ml-1 font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                        onClick={() => copyToClipboard(client.id)}
                                        title="Click to copy"
                                    >
                                        {client.id}
                                    </span>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                    {client.email}
                                </p>
                                {client.phone && (
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {client.phone}
                                    </p>
                                )}
                                {client.company_name && (
                                    <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                                        Company: {client.company_name}
                                    </p>
                                )}
                                <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                                    Created: {formatDate(client.created_at)}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {client.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Modal for creating/editing clients */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                clientData={clientToEdit}
                darkMode={darkMode}
            />
        </div>
    );
}