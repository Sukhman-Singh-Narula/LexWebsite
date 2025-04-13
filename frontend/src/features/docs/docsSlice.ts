// src/features/docs/docsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Document type definitions
export interface Document {
    id: string;
    case_id: string;
    title: string;
    document_type: 'pleading' | 'contract' | 'evidence' | 'correspondence' | 'other';
    description?: string;
    s3_path: string;
    original_filename: string;
    file_size?: number;
    mime_type?: string;
    status: 'pending' | 'processing' | 'processed' | 'error';
    created_at: string;
    updated_at: string;
}

// Document state interface
interface DocumentsState {
    documents: Document[];
    selectedDocument: Document | null;
    loading: boolean;
    error: string | null;
    uploadLoading: boolean;
    uploadError: string | null;
    uploadSuccess: boolean;
}

// Initial state
const initialState: DocumentsState = {
    documents: [],
    selectedDocument: null,
    loading: false,
    error: null,
    uploadLoading: false,
    uploadError: null,
    uploadSuccess: false
};

// Fetch documents for a specific case
export const fetchDocuments = createAsyncThunk<
    Document[],
    string, // caseId
    { rejectValue: { detail: string } }
>(
    'documents/fetchDocuments',
    async (caseId, { rejectWithValue }) => {
        try {
            console.log(`Fetching documents for case ID: ${caseId}`);
            const response = await api.get<Document[]>(`/documents/case/${caseId}`);
            console.log('Documents fetched successfully:', response.data.length);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching documents:', error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to fetch documents' });
        }
    }
);

// Upload a document
export const uploadDocument = createAsyncThunk<
    Document,
    FormData, // FormData containing file and metadata
    { rejectValue: { detail: string } }
>(
    'documents/uploadDocument',
    async (formData, { rejectWithValue }) => {
        try {
            console.log('Uploading document...');
            const response = await api.post<Document>('/documents/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Document uploaded successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error uploading document:', error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to upload document' });
        }
    }
);

// Download a document (returns URL)
export const getDocumentDownloadUrl = createAsyncThunk<
    string,
    string, // document ID
    { rejectValue: { detail: string } }
>(
    'documents/getDocumentDownloadUrl',
    async (documentId, { rejectWithValue }) => {
        try {
            console.log(`Getting download URL for document ID: ${documentId}`);
            const response = await api.get<{ url: string }>(`/documents/${documentId}/download`);
            console.log('Got download URL:', response.data.url);
            return response.data.url;
        } catch (error: any) {
            console.error('Error getting document download URL:', error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to get document download URL' });
        }
    }
);
export const downloadDocument = createAsyncThunk(
    'docs/downloadDocument',
    async (documentId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/documents/${documentId}/content`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to download document');
        }
    }
);



// Create the documents slice
const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearDocumentsError: (state) => {
            state.error = null;
        },
        clearUploadStatus: (state) => {
            state.uploadError = null;
            state.uploadSuccess = false;
        },
        setSelectedDocument: (state, action: PayloadAction<Document | null>) => {
            state.selectedDocument = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch documents
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<Document[]>) => {
                state.loading = false;
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Failed to fetch documents';
            })

            // Upload document
            .addCase(uploadDocument.pending, (state) => {
                state.uploadLoading = true;
                state.uploadError = null;
                state.uploadSuccess = false;
            })
            .addCase(uploadDocument.fulfilled, (state, action: PayloadAction<Document>) => {
                state.uploadLoading = false;
                state.uploadSuccess = true;
                state.documents.push(action.payload);
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploadLoading = false;
                state.uploadError = action.payload?.detail || 'Failed to upload document';
            })

            // Download document
            .addCase(downloadDocument.pending, (state) => {
                state.downloadLoading = true;
                state.downloadError = null;
            })
            .addCase(downloadDocument.fulfilled, (state) => {
                state.downloadLoading = false;
            })
            .addCase(downloadDocument.rejected, (state, action) => {
                state.downloadLoading = false;
                state.downloadError = action.payload || 'Failed to download document';
            });
    },
});


// Export actions and reducer
export const { clearDocumentsError, clearUploadStatus, setSelectedDocument } = documentsSlice.actions;

// Selectors
export const selectDocuments = (state: { documents: DocumentsState }) => state.documents.documents;
export const selectSelectedDocument = (state: { documents: DocumentsState }) => state.documents.selectedDocument;
export const selectDocumentsLoading = (state: { documents: DocumentsState }) => state.documents.loading;
export const selectDocumentsError = (state: { documents: DocumentsState }) => state.documents.error;
export const selectUploadLoading = (state: { documents: DocumentsState }) => state.documents.uploadLoading;
export const selectUploadError = (state: { documents: DocumentsState }) => state.documents.uploadError;
export const selectUploadSuccess = (state: { documents: DocumentsState }) => state.documents.uploadSuccess;
export const selectDownloadLoading = (state: { documents: DocumentsState }) => state.documents.downloadLoading;
export const selectDownloadError = (state: { documents: DocumentsState }) => state.documents.downloadError;


export default documentsSlice.reducer;