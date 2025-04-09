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
    Partial<Case>,
    { rejectValue: any }
>(
    'cases/createCase',
    async (caseData, { rejectWithValue }) => {
        try {
            console.log('Creating new case with data:', caseData);

            // Log the exact payload being sent
            console.log('Case creation payload:', JSON.stringify(caseData));

            const response = await api.post<Case>('/cases', caseData);
            console.log('Case created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating case:', error);

            // If it's an Axios error with a response
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }

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
            console.log(`Updating case ${id} with data:`, data);
            const response = await api.put<Case>(`/cases/${id}`, data);
            console.log('Case updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating case ${id}:`, error);
            return rejectWithValue(handleApiError(error));
        }
    }
);