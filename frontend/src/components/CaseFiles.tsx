// src/components/CaseFiles.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchDocuments,
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsError,
  uploadDocument,
  selectUploadLoading,
  selectUploadError,
  selectUploadSuccess,
  clearUploadStatus,
  downloadDocument
} from '../features/docs/docsSlice';
import { File, Upload, Download, AlertCircle, X, FileText, FilePlus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
// Import PDF components
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = "http://localhost:3000/pdf.worker.min.js";

// Document viewer modal component
interface ViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentTitle: string;
  mimeType: string;
  darkMode: boolean;
}

const DocumentViewerModal: React.FC<ViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentTitle,
  mimeType,
  darkMode
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Page navigation
  const previousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const nextPage = () => {
    setPageNumber(prevPageNumber => numPages ? Math.min(prevPageNumber + 1, numPages) : prevPageNumber);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (!isOpen || !documentUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-4 w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold truncate">{documentTitle}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-10 ${darkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
              }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-auto border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
          {mimeType === 'application/pdf' ? (
            <div className="flex flex-col items-center">
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="pdf-document"
                loading={
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e8c4b8]"></div>
                  </div>
                }
                error={
                  <div className={`p-4 text-center ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p>Failed to load PDF document.</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mx-auto"
                  scale={1.2}
                />
              </Document>

              {numPages && (
                <div className={`flex justify-between items-center p-2 w-full mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  <button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className={`p-2 rounded ${pageNumber <= 1
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <p>
                    Page {pageNumber} of {numPages}
                  </p>
                  <button
                    onClick={nextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className={`p-2 rounded ${pageNumber >= (numPages || 1)
                      ? 'opacity-50 cursor-not-allowed'
                      : darkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText size={48} className="mb-4 opacity-60" />
              <p className="mb-4 text-center">
                Preview not available for this file type.
              </p>
              <a
                href={documentUrl}
                download={documentTitle}
                className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors duration-300 flex items-center gap-2`}
              >
                <Download size={16} />
                Download to View
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <a
            href={documentUrl}
            download={documentTitle}
            className={`px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2`}
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

// Document upload modal
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  caseId: string;
  uploading: boolean;
  darkMode: boolean;
}

const DocumentUploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  caseId,
  uploading,
  darkMode
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('pleading');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('case_id', caseId);
    formData.append('document_type', documentType);

    if (description) {
      formData.append('description', description);
    }

    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-opacity-10 ${darkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
              }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e8c4b8] transition-colors duration-300 ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 bg-white text-gray-900'
                }`}
              required
            >
              <option value="pleading">Pleading</option>
              <option value="contract">Contract</option>
              <option value="evidence">Evidence</option>
              <option value="correspondence">Correspondence</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e8c4b8] transition-colors duration-300 ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 bg-white text-gray-900'
                }`}
              rows={3}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              File
            </label>
            <div className={`border border-dashed rounded-md p-4 text-center ${darkMode
              ? 'border-gray-600 hover:border-gray-500'
              : 'border-gray-300 hover:border-gray-400'
              } transition-colors duration-300`}
            >
              <input
                type="file"
                className="hidden"
                id="document-upload"
                onChange={handleFileChange}
                required
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center justify-center py-3"
              >
                <Upload className={`mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                {selectedFile ? (
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                  </span>
                ) : (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click to browse or drag and drop
                  </span>
                )}
              </label>
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
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2"
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CaseFilesProps {
  caseId: string;
  darkMode: boolean;
}

const CaseFiles: React.FC<CaseFilesProps> = ({ caseId, darkMode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector(selectDocuments);
  const loading = useSelector(selectDocumentsLoading);
  const error = useSelector(selectDocumentsError);
  const uploadLoading = useSelector(selectUploadLoading);
  const uploadError = useSelector(selectUploadError);
  const uploadSuccess = useSelector(selectUploadSuccess);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    if (caseId) {
      dispatch(fetchDocuments(caseId));
    }
  }, [caseId, dispatch]);

  // Clear upload status when modal opens/closes
  useEffect(() => {
    if (!isUploadModalOpen) {
      dispatch(clearUploadStatus());
    }
  }, [isUploadModalOpen, dispatch]);

  // Close modal on successful upload
  useEffect(() => {
    if (uploadSuccess) {
      setIsUploadModalOpen(false);
      // Refresh documents list after successful upload
      dispatch(fetchDocuments(caseId));
    }
  }, [uploadSuccess, caseId, dispatch]);

  // Clean up when viewer modal closes
  useEffect(() => {
    if (!viewerModalOpen && documentUrl) {
      // Revoke object URL when no longer needed to avoid memory leaks
      URL.revokeObjectURL(documentUrl);
      setDocumentUrl(null);
    }
  }, [viewerModalOpen, documentUrl]);

  const handleUpload = (formData: FormData) => {
    dispatch(uploadDocument(formData));
  };

  // In CaseFiles.tsx
  const handleViewDocument = async (document: any) => {
    try {
      setSelectedDocument(document);

      // Using the downloadDocument action
      const response = await dispatch(downloadDocument(document.id)).unwrap();

      // Use the blob URL from the response
      setDocumentUrl(response.blobUrl);

      // Open the viewer modal
      setViewerModalOpen(true);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Map document type to display name
  const getDocumentTypeName = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'pleading': 'Pleading',
      'contract': 'Contract',
      'evidence': 'Evidence',
      'correspondence': 'Correspondence',
      'other': 'Other'
    };

    return typeMap[type] || type;
  };

  // Map document status to display style
  const getStatusStyles = (status: string): { bgColor: string, textColor: string } => {
    switch (status) {
      case 'pending':
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'processing':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'processed':
        return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'error':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e8c4b8]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-4 flex items-start ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-700'}`}>
        <AlertCircle className="mt-0.5 mr-3 flex-shrink-0" size={18} />
        <div>
          <h3 className="font-medium">Error loading documents</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => dispatch(fetchDocuments(caseId))}
            className={`mt-2 text-sm font-medium underline ${darkMode ? 'text-red-200' : 'text-red-700'}`}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Case Documents
        </h2>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2"
        >
          <FilePlus size={16} />
          Upload Document
        </button>
      </div>

      {uploadError && (
        <div className={`rounded-lg p-4 mb-4 flex items-start ${darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-700'}`}>
          <AlertCircle className="mt-0.5 mr-3 flex-shrink-0" size={18} />
          <div>
            <h3 className="font-medium">Error uploading document</h3>
            <p className="text-sm">{uploadError}</p>
          </div>
          <button
            onClick={() => dispatch(clearUploadStatus())}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="mb-4">This case doesn't have any documents yet.</p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 inline-flex items-center gap-2"
          >
            <Upload size={16} />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Document
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Type
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Size
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Uploaded
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {documents.map((doc) => {
                const { bgColor, textColor } = getStatusStyles(doc.status);
                return (
                  <tr key={doc.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center">
                        <File className={`flex-shrink-0 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.description && (
                            <div className={`text-sm truncate max-w-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {getDocumentTypeName(doc.document_type)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatDate(doc.created_at)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap`}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className={`p-2 rounded hover:bg-opacity-10 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-100'
                          }`}
                        title="View document"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className={`ml-2 p-2 rounded hover:bg-opacity-10 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-100'
                          }`}
                        title="Download document"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        caseId={caseId}
        uploading={uploadLoading}
        darkMode={darkMode}
      />

      {selectedDocument && (
        <DocumentViewerModal
          isOpen={viewerModalOpen}
          onClose={() => setViewerModalOpen(false)}
          documentUrl={documentUrl}
          documentTitle={selectedDocument.title}
          mimeType={selectedDocument.mime_type}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default CaseFiles;