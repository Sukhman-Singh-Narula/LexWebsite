import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { selectSelectedCase, selectCasesLoading } from '../features/cases/caseSlices';
import CaseFiles from '../components/CaseFiles';
import { ArrowLeft, Briefcase, File } from 'lucide-react';

interface CaseFilesPageProps {
  darkMode: boolean;
}

const CaseFilesPage: React.FC<CaseFilesPageProps> = ({ darkMode }) => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const selectedCase = useSelector(selectSelectedCase);
  const loading = useSelector(selectCasesLoading);

  useEffect(() => {
    // NOTE: The fetchCase action is not available in caseSlices.ts
    // We'll need to implement a way to fetch case details if needed
    console.log("Case ID:", caseId);
    
    // For now, we'll just rely on the case data that's already in the redux store
    // In a real app, you'd dispatch an action to fetch the case if it's not already loaded
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e8c4b8]"></div>
      </div>
    );
  }

  if (!selectedCase && !loading) {
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
      {/* Case header with navigation */}
      <div className={`mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <button
          onClick={() => navigate(`/cases/${caseId}`)}
          className={`mb-4 inline-flex items-center gap-1 text-sm font-medium ${
            darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors duration-200`}
        >
          <ArrowLeft size={16} />
          Back to Case
        </button>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-2xl font-bold">{selectedCase?.title}</h1>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            selectedCase?.status === 'active' ? 'bg-blue-100 text-blue-800' :
            selectedCase?.status === 'pending' ? 'bg-amber-100 text-amber-800' :
            selectedCase?.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-gray-100 text-gray-800' // Default for 'draft' or any other status
          }`}>
            {selectedCase?.status.charAt(0).toUpperCase() + selectedCase?.status.slice(1)}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-[#f8eae5] text-gray-800`}>
            Case #{selectedCase?.case_number}
          </div>
        </div>
        
        <div className="mt-2 flex space-x-4">
          <a 
            href="#documents" 
            className={`inline-flex items-center gap-1 border-b-2 py-2 text-sm font-medium ${
              darkMode 
                ? 'border-[#e8c4b8] text-[#e8c4b8]' 
                : 'border-[#e8c4b8] text-gray-900'
            }`}
          >
            <File size={16} />
            Documents
          </a>
        </div>
      </div>

      <div className="mb-6">
        {/* The CaseFiles component */}
        {caseId && <CaseFiles darkMode={darkMode} caseId={caseId} />}
      </div>
    </div>
  );
};

export default CaseFilesPage;