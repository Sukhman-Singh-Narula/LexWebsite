import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchCase, selectSelectedCase, selectCasesLoading, selectCasesError } from '../features/cases/caseSlices';
import { ArrowLeft, File, Clock, User, Briefcase, FileText, BookOpen, AlertTriangle, Scale, Users, FileCheck, Calendar } from 'lucide-react';

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
                            {selectedCase.cnr && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                    CNR: {selectedCase.cnr}
                                </span>
                            )}
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
                        <p className={`whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

            {/* Court Case Details Section */}
            {selectedCase.cnr && (
                <div className={`rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Scale size={24} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Court Case Details
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                CNR: {selectedCase.cnr}
                            </span>
                            {selectedCase.court_case_type && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
                                    {selectedCase.court_case_type}
                                </span>
                            )}
                            {selectedCase.filing_number && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                                    Filing: {selectedCase.filing_number}
                                </span>
                            )}
                            {selectedCase.registration_number && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
                                    Registration: {selectedCase.registration_number}
                                </span>
                            )}
                        </div>

                        {/* Court Status */}
                        {selectedCase.court_status && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    <AlertTriangle size={18} />
                                    Status Information
                                </h3>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCase.court_status.caseStage && (
                                            <div>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Case Stage</p>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {selectedCase.court_status.caseStage}
                                                </p>
                                            </div>
                                        )}
                                        {selectedCase.court_status.courtNumberAndJudge && (
                                            <div>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Court / Judge</p>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {selectedCase.court_status.courtNumberAndJudge}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {selectedCase.court_status.firstHearingDate && (
                                            <div>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>First Hearing</p>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {formatDate(selectedCase.court_status.firstHearingDate)}
                                                </p>
                                            </div>
                                        )}
                                        {selectedCase.court_status.nextHearingDate && (
                                            <div>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Next Hearing</p>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {formatDate(selectedCase.court_status.nextHearingDate)}
                                                </p>
                                            </div>
                                        )}
                                        {selectedCase.court_status.decisionDate && (
                                            <div>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Decision Date</p>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {formatDate(selectedCase.court_status.decisionDate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedCase.court_status.natureOfDisposal && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nature of Disposal</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.court_status.natureOfDisposal}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Parties */}
                        {selectedCase.parties_details && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    <Users size={18} />
                                    Parties
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Petitioners */}
                                    {selectedCase.parties_details.petitioners && selectedCase.parties_details.petitioners.length > 0 && (
                                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Petitioners
                                            </h4>
                                            <ul className="list-disc list-inside">
                                                {selectedCase.parties_details.petitioners.map((party, index) => (
                                                    <li key={index} className={darkMode ? 'text-white' : 'text-gray-800'}>
                                                        {party}
                                                    </li>
                                                ))}
                                            </ul>

                                            {selectedCase.parties_details.petitionerAdvocates &&
                                                selectedCase.parties_details.petitionerAdvocates.filter(adv => adv).length > 0 && (
                                                    <div className="mt-2">
                                                        <h5 className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Advocates
                                                        </h5>
                                                        <ul className="list-disc list-inside">
                                                            {selectedCase.parties_details.petitionerAdvocates
                                                                .filter(adv => adv) // Filter out empty strings
                                                                .map((advocate, index) => (
                                                                    <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {advocate}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* Respondents */}
                                    {selectedCase.parties_details.respondents && selectedCase.parties_details.respondents.length > 0 && (
                                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Respondents
                                            </h4>
                                            <ul className="list-disc list-inside">
                                                {selectedCase.parties_details.respondents.map((party, index) => (
                                                    <li key={index} className={darkMode ? 'text-white' : 'text-gray-800'}>
                                                        {party}
                                                    </li>
                                                ))}
                                            </ul>

                                            {selectedCase.parties_details.respondentAdvocates &&
                                                selectedCase.parties_details.respondentAdvocates.filter(adv => adv).length > 0 && (
                                                    <div className="mt-2">
                                                        <h5 className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Advocates
                                                        </h5>
                                                        <ul className="list-disc list-inside">
                                                            {selectedCase.parties_details.respondentAdvocates
                                                                .filter(adv => adv) // Filter out empty strings
                                                                .map((advocate, index) => (
                                                                    <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        {advocate}
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Acts & Sections */}
                        {selectedCase.acts_sections && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    <BookOpen size={18} />
                                    Acts & Sections
                                </h3>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    {selectedCase.acts_sections.acts && (
                                        <div className="mb-2">
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acts</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.acts_sections.acts}
                                            </p>
                                        </div>
                                    )}
                                    {selectedCase.acts_sections.sections && (
                                        <div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sections</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.acts_sections.sections}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* FIR Details */}
                        {selectedCase.fir_details && selectedCase.fir_details.policeStation && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    <FileCheck size={18} />
                                    FIR Details
                                </h3>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Police Station</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.fir_details.policeStation}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>FIR Number</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.fir_details.firNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Year</p>
                                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {selectedCase.fir_details.year}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Case History */}
                        {selectedCase.court_history && selectedCase.court_history.length > 0 && (
                            <div className="mb-6">
                                <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    <Calendar size={18} />
                                    Case History
                                </h3>
                                <div className={`rounded-lg border overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'
                                        }`}>
                                        <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                                            <tr>
                                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    Date
                                                </th>
                                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    Judge
                                                </th>
                                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    Purpose
                                                </th>
                                                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    Next Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                            {selectedCase.court_history.map((item, index) => (
                                                <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'
                                                        }`}>
                                                        {formatDate(item.businessDate)}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'
                                                        }`}>
                                                        {item.judge}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'
                                                        }`}>
                                                        {item.purpose}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'
                                                        }`}>
                                                        {item.nextDate && new Date(item.nextDate).getFullYear() > 1970
                                                            ? formatDate(item.nextDate)
                                                            : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseDetail;