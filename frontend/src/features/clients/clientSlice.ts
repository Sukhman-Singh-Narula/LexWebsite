// src/features/clients/clientSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define Client type based on your API response
export interface Client {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    address?: Record<string, any>; // or a more specific type if you know the structure
    company_name?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Create client request type
export interface ClientCreate {
    email: string;
    full_name: string;
    phone?: string;
    address?: Record<string, any>;
    company_name?: string;
}

// Update client request type
export interface ClientUpdate {
    email?: string;
    full_name?: string;
    phone?: string;
    address?: Record<string, any>;
    company_name?: string;
}

// Client state interface
interface ClientsState {
    clients: Client[];
    selectedClient: Client | null;
    loading: boolean;
    error: string | null;
    createClientLoading: boolean;
    updateClientLoading: boolean;
}

// Initial state
const initialState: ClientsState = {
    clients: [],
    selectedClient: null,
    loading: false,
    error: null,
    createClientLoading: false,
    updateClientLoading: false
};

// Fetch clients async thunk
export const fetchClients = createAsyncThunk<
    Client[],
    void,
    { rejectValue: { detail: string } }
>(
    'clients/fetchClients',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching clients...');
            const response = await api.get<Client[]>('/clients');
            console.log('Clients fetched successfully:', response.data.length);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching clients:', error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to fetch clients' });
        }
    }
);

// Fetch single client
export const fetchClient = createAsyncThunk<
    Client,
    string, // client ID
    { rejectValue: { detail: string } }
>(
    'clients/fetchClient',
    async (clientId, { rejectWithValue }) => {
        try {
            console.log(`Fetching client with ID: ${clientId}`);
            const response = await api.get<Client>(`/clients/${clientId}`);
            console.log('Client fetched successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching client ${clientId}:`, error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to fetch client details' });
        }
    }
);

// Create a new client
export const createClient = createAsyncThunk<
    Client,
    ClientCreate,
    { rejectValue: { detail: string } }
>(
    'clients/createClient',
    async (clientData, { rejectWithValue }) => {
        try {
            console.log('Creating new client with data:', clientData);
            const response = await api.post<Client>('/clients', clientData);
            console.log('Client created successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating client:', error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to create client' });
        }
    }
);

// Update a client
export const updateClient = createAsyncThunk<
    Client,
    { id: string; data: ClientUpdate },
    { rejectValue: { detail: string } }
>(
    'clients/updateClient',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            console.log(`Updating client ${id} with data:`, data);
            const response = await api.put<Client>(`/clients/${id}`, data);
            console.log('Client updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating client ${id}:`, error);
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ detail: 'Failed to update client' });
        }
    }
);

// Create the slice
const clientsSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {
        clearClientsError: (state) => {
            state.error = null;
        },
        setSelectedClient: (state, action: PayloadAction<Client | null>) => {
            state.selectedClient = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch clients
            .addCase(fetchClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
                state.loading = false;
                state.clients = action.payload;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Failed to fetch clients';
            })

            // Fetch single client
            .addCase(fetchClient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClient.fulfilled, (state, action: PayloadAction<Client>) => {
                state.loading = false;
                state.selectedClient = action.payload;
            })
            .addCase(fetchClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Failed to fetch client details';
            })

            // Create client
            .addCase(createClient.pending, (state) => {
                state.createClientLoading = true;
                state.error = null;
            })
            .addCase(createClient.fulfilled, (state, action: PayloadAction<Client>) => {
                state.createClientLoading = false;
                state.clients.push(action.payload);
            })
            .addCase(createClient.rejected, (state, action) => {
                state.createClientLoading = false;
                state.error = action.payload?.detail || 'Failed to create client';
            })

            // Update client
            .addCase(updateClient.pending, (state) => {
                state.updateClientLoading = true;
                state.error = null;
            })
            .addCase(updateClient.fulfilled, (state, action: PayloadAction<Client>) => {
                state.updateClientLoading = false;
                // Update the client in the array
                const index = state.clients.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.clients[index] = action.payload;
                }
                // Update selectedClient if it's the same client
                if (state.selectedClient?.id === action.payload.id) {
                    state.selectedClient = action.payload;
                }
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.updateClientLoading = false;
                state.error = action.payload?.detail || 'Failed to update client';
            });
    },
});

// Export actions and reducer
export const { clearClientsError, setSelectedClient } = clientsSlice.actions;

// Selectors
export const selectClients = (state: { clients: ClientsState }) => state.clients.clients;
export const selectSelectedClient = (state: { clients: ClientsState }) => state.clients.selectedClient;
export const selectClientsLoading = (state: { clients: ClientsState }) => state.clients.loading;
export const selectClientsError = (state: { clients: ClientsState }) => state.clients.error;
export const selectCreateClientLoading = (state: { clients: ClientsState }) => state.clients.createClientLoading;
export const selectUpdateClientLoading = (state: { clients: ClientsState }) => state.clients.updateClientLoading;

export default clientsSlice.reducer;