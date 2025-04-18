import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Case } from './caseSlices';

// Helper function to handle API errors consistently
const handleApiError = (error: any) => {
    console.log('API Error details:', error);

    // If we have a response with data
    if (error.response && error.response.data) {
        return error.response.data;
    }

    // If it's a network error
    if (error.message) {
        return { detail: `Network error: ${error.message}` };
    }

    // Default error
    return { detail: 'An unexpected error occurred. Please try again.' };
};

// Fetch cases
export const fetchCases = createAsyncThunk<
    Case[],
    void,
    { rejectValue: any }
>(
    'cases/fetchCases',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching cases...');
            const response = await api.get<Case[]>('/cases');

            // Map API data to include UI fields
            const casesWithUIFields = response.data.map(caseItem => ({
                ...caseItem,
                // Randomly assign priority for demo purposes
                priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
                client: 'Client information'
            }));

            console.log('Cases fetched successfully:', casesWithUIFields.length);
            return casesWithUIFields;
        } catch (error: any) {
            console.error('Error fetching cases:', error);
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Fetch single case
export const fetchCase = createAsyncThunk<
    Case,
    string, // case ID
    { rejectValue: any }
>(
    'cases/fetchCase',
    async (caseId, { rejectWithValue }) => {
        try {
            console.log(`Fetching case with ID: ${caseId}`);
            const response = await api.get<Case>(`/cases/${caseId}`);
            console.log('Case fetched successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching case ${caseId}:`, error);
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Create a new case
export const createCase = createAsyncThunk<
    Case,
    Partial<Case> & { courtCaseDetails?: any },
    { rejectValue: any }
>(
    'cases/createCase',
    async (caseData, { rejectWithValue }) => {
        try {
            // Validate required fields client-side to prevent unnecessary API calls
            if (!caseData.title || !caseData.client_id) {
                throw new Error('Missing required fields: title and client_id are required');
            }

            console.log('Creating new case with data:', caseData);

            // Extract court case details if available
            const { courtCaseDetails, ...casePayload } = caseData;

            // Prepare normalized data for the API
            let normalizedData: any = {
                ...casePayload,
                // Ensure status is lowercase
                status: casePayload.status ? casePayload.status.toLowerCase() : 'draft',
            };

            // If court case details are available, include them
            if (courtCaseDetails) {
                normalizedData = {
                    ...normalizedData,
                    cnr: courtCaseDetails.cnr,
                    court_case_title: courtCaseDetails.title,
                    court_case_type: courtCaseDetails.details?.type,
                    filing_number: courtCaseDetails.details?.filingNumber,
                    registration_number: courtCaseDetails.details?.registrationNumber,
                    court_status: courtCaseDetails.status,
                    parties_details: courtCaseDetails.parties,
                    acts_sections: courtCaseDetails.actsAndSections,
                    fir_details: courtCaseDetails.firstInformationReport || {},
                    court_history: courtCaseDetails.history || [],
                };
            }

            console.log('Normalized case creation payload:', JSON.stringify(normalizedData));

            // Make the API call with the normalized data
            const response = await api.post<Case>('/cases', normalizedData);

            console.log('Case created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating case:', error);
            return rejectWithValue(handleApiError(error));
        }
    }
);

// Update a case
export const updateCase = createAsyncThunk<
    Case,
    { id: string; data: Partial<Case> },
    { rejectValue: any }
>(
    'cases/updateCase',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            // Normalize the data for the API
            const normalizedData = {
                ...data,
                // Ensure status is lowercase if provided
                ...(data.status && { status: data.status.toLowerCase() }),
            };

            console.log(`Updating case ${id} with normalized data:`, normalizedData);

            const response = await api.put<Case>(`/cases/${id}`, normalizedData);
            console.log('Case updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating case ${id}:`, error);
            return rejectWithValue(handleApiError(error));
        }
    }
);

// In frontend/src/features/cases/caseActions.ts
export const fetchCourtCaseDetails = createAsyncThunk<
    any,
    string,
    { rejectValue: any }
>(
    'cases/fetchCourtCaseDetails',
    async (cnr, { rejectWithValue }) => {
        try {
            const response = await api.post('/cases/fetch-court-details', { cnr });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching court case details:', error);
            return rejectWithValue(handleApiError(error));
        }
    }
);