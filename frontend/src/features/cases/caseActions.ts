import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Case } from './caseSlices';

// Fetch single case
export const fetchCase = createAsyncThunk<
    Case,
    string, // case ID
    { rejectValue: { detail: string } }
>(
    'cases/fetchCase',
    async (caseId, { rejectWithValue }) => {
        try {
            const response = await api.get<Case>(`/cases/${caseId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to fetch case details' });
        }
    }
);

// Create a new case
export const createCase = createAsyncThunk<
    Case,
    Partial<Case>,
    { rejectValue: { detail: string } }
>(
    'cases/createCase',
    async (caseData, { rejectWithValue }) => {
        try {
            const response = await api.post<Case>('/cases', caseData);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to create case' });
        }
    }
);

// Update a case
export const updateCase = createAsyncThunk<
    Case,
    { id: string; data: Partial<Case> },
    { rejectValue: { detail: string } }
>(
    'cases/updateCase',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put<Case>(`/cases/${id}`, data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to update case' });
        }
    }
);