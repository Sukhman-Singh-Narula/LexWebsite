import React, { useState, useEffect } from 'react';
import { MoreVertical, Grid, List, RefreshCcw, PlusCircle, Edit, Trash } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchCases,
  Case,
  selectCases,
  selectCasesLoading,
  selectCasesError,
  setSelectedCase
} from '../features/cases/caseSlices';
import CaseModal from './CaseModal';

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  closed: 'bg-gray-100 text-gray-800'
};

// Map API status to display text
const statusDisplayText = {
  draft: 'Draft',
  active: 'Active',
  pending: 'Pending',
  closed: 'Closed'
};

interface CaseGridProps {
  darkMode: boolean;
}

export default function CaseGrid({ darkMode }: CaseGridProps) {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<Case | undefined>(undefined);

  const dispatch = useDispatch<AppDispatch>();

  // Select cases from Redux store using selectors
  const cases = useSelector(selectCases);
  const loading = useSelector(selectCasesLoading);
  const error = useSelector(selectCasesError);

  // Fetch cases on component mount
  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCases());
  };

  const handleCreateCase = () => {
    setCaseToEdit(undefined); // Make sure we're not in edit mode
    setIsModalOpen(true);
  };

  const handleEditCase = (caseData: Case) => {
    setCaseToEdit(caseData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh the cases list after closing the modal
    dispatch(fetchCases());
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
        return 'An error occurred while fetching cases';
      }
    }
    return 'An unknown error occurred';
  };

  return (
    <div className={`p-6 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome to LexAI
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your AI-powered legal assistant
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Cases</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleCreateCase}
            className={`mr-2 px-3 py-2 rounded-md flex items-center gap-1 ${darkMode
              ? 'bg-[#e8c4b8] text-gray-900 hover:bg-[#ddb3a7]'
              : 'bg-[#e8c4b8] text-gray-900 hover:bg-[#ddb3a7]'
              }`}
          >
            <PlusCircle size={16} />
            <span>New Case</span>
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
          Loading cases...
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

      {!loading && !error && cases.length === 0 && (
        <div className={`bg-${darkMode ? 'gray-800' : 'white'} rounded-lg p-8 text-center shadow`}>
          <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No cases found
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            You don't have any cases yet. Create a new case to get started.
          </p>
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {cases.map((case_) => (
            <div
              key={case_.id}
              className={`rounded-lg border p-4 hover:shadow-lg transition-shadow ${darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {case_.title}
                </h3>
                <div className="flex space-x-1">
                  <button
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    onClick={() => handleEditCase(case_)}
                    title="Edit case"
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
              <div className="space-y-2">
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Case Number: {case_.case_number}
                </p>
                <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                  Last updated: {formatDate(case_.updated_at)}
                </p>
                <div className="flex gap-2 mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[case_.status as keyof typeof statusColors]}`}>
                    {statusDisplayText[case_.status as keyof typeof statusDisplayText]}
                  </span>
                  {case_.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
                      {case_.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Modal for creating/editing cases */}
      <CaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={caseToEdit}
        darkMode={darkMode}
      />
    </div>
  );
}