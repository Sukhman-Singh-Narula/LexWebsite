import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchCase, selectSelectedCase, selectCasesLoading, selectCasesError } from '../features/cases/caseSlices';
import { ArrowLeft, File, Clock, User, Briefcase, FileText } from 'lucide-react';

interface CaseDetailProps {
    darkMode: boolean;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ darkMode }) => {
    const { caseId } = useParams<{ caseId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const selectedCase = useSelector(selectSelectedCase);
    const loading = useSelector(selectCasesLoading);
    const error = useSelector(selectCasesError);

    useEffect(() => {
        if (caseId) {
            dispatch(fetchCase(caseId));
        }
    }, [caseId, dispatch]);

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e8c4b8]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate('/cases')}
                    className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md inline-flex items-center gap-2 font-medium hover:bg-[#ddb3a7] transition-colors duration-300"
                >
                    <ArrowLeft size={16} />
                    Back to Cases
                </button>
            </div>
        );
    }

    if (!selectedCase) {
        return (
            <div className="p-6">
                <div className={`text-center py-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase size={64} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
                    <p className="mb-4">The case you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/cases')}
                        className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md inline-flex items-center gap-2 font-medium hover:bg-[#ddb3a7] transition-colors duration-300"
                    >
                        <ArrowLeft size={16} />
                        Back to Cases
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/cases')}
                className={`mb-4 inline-flex items-center gap-1 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    } transition-colors duration-200`}
            >
                <ArrowLeft size={16} />
                Back to All Cases
            </button>

            <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'
                }`}>
                <div className="flex flex-wrap justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{selectedCase.title}</h1>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCase.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                    selectedCase.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                        selectedCase.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                            'bg-gray-100 text-gray-800' // Default for 'draft' or any other status
                                }`}>
                                {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                            </span>
                            {selectedCase.priority && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCase.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        selectedCase.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800' // Low priority
                                    }`}>
                                    {selectedCase.priority}
                                </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#f8eae5] text-gray-800`}>
                                Case #{selectedCase.case_number}
                            </span>
                        </div>
                    </div>

                    <Link
                        to={`/cases/${selectedCase.id}/files`}
                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-md ${darkMode
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-[#e8c4b8] text-gray-900 hover:bg-[#ddb3a7]'
                            } transition-colors duration-200`}
                    >
                        <File size={16} />
                        View Files
                    </Link>
                </div>

                {selectedCase.description && (
                    <div className="mb-6">
                        <h2 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Description
                        </h2>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedCase.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                            <Clock size={16} />
                            TIMELINE
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created</p>
                                <p className="font-medium">{formatDate(selectedCase.created_at)}</p>
                            </div>
                            <div>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                                <p className="font-medium">{formatDate(selectedCase.updated_at)}</p>
                            </div>
                            {selectedCase.filing_date && (
                                <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Filing Date</p>
                                    <p className="font-medium">{formatDate(selectedCase.filing_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                            <User size={16} />
                            CLIENT INFORMATION
                        </h3>
                        <div>
                            <p className="font-medium">{selectedCase.client || 'Client information not available'}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Client ID: {selectedCase.client_id}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* More case details could be added here */}
        </div>
    );
};

export default CaseDetail;