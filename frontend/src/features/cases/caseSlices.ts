// src/features/cases/caseSlices.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Import the case actions
import { fetchCase, createCase, updateCase, fetchCases, fetchCourtCaseDetails } from './caseActions';

// Define Case type based on your API response
export interface Case {
    id: string;
    title: string;
    case_number: string;
    description?: string;
    status: 'draft' | 'active' | 'pending' | 'closed'; // lowercase to match backend enum
    client_id: string;
    filing_date?: string;
    created_at: string;
    updated_at: string;
    // Derived fields for UI (not from API)
    client?: string;
    priority?: 'High' | 'Medium' | 'Low';
}

// Additional state for individual case handling
interface CasesState {
    cases: Case[];
    selectedCase: Case | null;
    loading: boolean;
    error: string | null;
    createCaseLoading: boolean;
    updateCaseLoading: boolean;
    courtCaseDetails: any | null;
    fetchingCourtCase: boolean;
    courtCaseError: string | null;
}

const initialState: CasesState = {
    cases: [],
    selectedCase: null,
    loading: false,
    error: null,
    createCaseLoading: false,
    updateCaseLoading: false,
    courtCaseDetails: null,
    fetchingCourtCase: false,
    courtCaseError: null
};

// Create slice
const casesSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {
        clearCasesError: (state) => {
            state.error = null;
        },
        setSelectedCase: (state, action: PayloadAction<Case | null>) => {
            state.selectedCase = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cases
            .addCase(fetchCases.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCases.fulfilled, (state, action: PayloadAction<Case[]>) => {
                state.loading = false;
                state.cases = action.payload;
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Failed to fetch cases';
            })

            // Fetch single case
            .addCase(fetchCase.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCase.fulfilled, (state, action: PayloadAction<Case>) => {
                state.loading = false;
                state.selectedCase = action.payload;
            })
            .addCase(fetchCase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Failed to fetch case details';
            })

            // Create case
            .addCase(createCase.pending, (state) => {
                state.createCaseLoading = true;
                state.error = null;
            })
            .addCase(createCase.fulfilled, (state, action: PayloadAction<Case>) => {
                state.createCaseLoading = false;
                state.cases.push(action.payload);
            })
            .addCase(createCase.rejected, (state, action) => {
                state.createCaseLoading = false;
                state.error = action.payload?.detail || 'Failed to create case';
            })

            .addCase(updateCase.pending, (state) => {
                state.updateCaseLoading = true;
                state.error = null;
            })
            .addCase(updateCase.fulfilled, (state, action: PayloadAction<Case>) => {
                state.updateCaseLoading = false;
                // Update the case in the array
                const index = state.cases.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.cases[index] = action.payload;
                }
                // Update selectedCase if it's the same case
                if (state.selectedCase?.id === action.payload.id) {
                    state.selectedCase = action.payload;
                }
            })
            .addCase(updateCase.rejected, (state, action) => {
                state.updateCaseLoading = false;
                state.error = action.payload?.detail || 'Failed to update case';
            })
            .addCase(fetchCourtCaseDetails.pending, (state) => {
                state.fetchingCourtCase = true;
                state.courtCaseError = null;
            })
            .addCase(fetchCourtCaseDetails.fulfilled, (state, action) => {
                state.fetchingCourtCase = false;
                state.courtCaseDetails = action.payload;
            })
            .addCase(fetchCourtCaseDetails.rejected, (state, action) => {
                state.fetchingCourtCase = false;
                state.courtCaseError = action.payload?.detail || 'Failed to fetch court case details';
            });
    },
});

export const { clearCasesError, setSelectedCase } = casesSlice.actions;

// Selectors
export const selectCases = (state: { cases: CasesState }) => state.cases.cases;
export const selectSelectedCase = (state: { cases: CasesState }) => state.cases.selectedCase;
export const selectCasesLoading = (state: { cases: CasesState }) => state.cases.loading;
export const selectCasesError = (state: { cases: CasesState }) => state.cases.error;
export const selectCreateCaseLoading = (state: { cases: CasesState }) => state.cases.createCaseLoading;
export const selectUpdateCaseLoading = (state: { cases: CasesState }) => state.cases.updateCaseLoading;
export const selectCourtCaseDetails = (state: { cases: CasesState }) => state.cases.courtCaseDetails;
export const selectFetchingCourtCase = (state: { cases: CasesState }) => state.cases.fetchingCourtCase;
export const selectCourtCaseError = (state: { cases: CasesState }) => state.cases.courtCaseError;

// Export the fetchCase action so it can be imported in components
export { fetchCase, fetchCases, createCase, updateCase, fetchCourtCaseDetails };

export default casesSlice.reducer;