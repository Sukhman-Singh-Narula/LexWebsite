// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  bar_number: string;
  license_state: string;
  phone?: string;
  firm_name?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  bar_number: string;
  license_state: string;
  phone?: string;
  firm_name?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: User | null;
  signupSuccess: boolean;
  signupError: string | null;
  signupLoading: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

// API URLs
const API_BASE_URL = 'http://localhost:8000';
const LOGIN_URL = `${API_BASE_URL}/auth/token`;
const SIGNUP_URL = `${API_BASE_URL}/advocates/signup`;

// Async login thunk
export const login = createAsyncThunk<
  TokenResponse,
  LoginCredentials,
  { rejectValue: { detail: string } }
>(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Create form data (required for OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post<TokenResponse>(
        LOGIN_URL,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Store token in localStorage for persistence
      localStorage.setItem('token', response.data.access_token);
      setAuthHeader(response.data.access_token);

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ detail: 'Login failed. Please check your credentials and try again.' });
    }
  }
);

// Async signup thunk
export const signup = createAsyncThunk<
  User,
  SignupData,
  { rejectValue: { detail: string } }
>(
  'auth/signup',
  async (signupData, { rejectWithValue }) => {
    try {
      const response = await axios.post<User>(
        SIGNUP_URL,
        signupData
      );

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ detail: 'Signup failed. Please try again with different information.' });
    }
  }
);

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  user: null,
  signupSuccess: false,
  signupError: null,
  signupLoading: false
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      setAuthHeader(null);
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSignupStatus: (state) => {
      state.signupSuccess = false;
      state.signupError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login reducers
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<TokenResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Login failed';
      })

      // Signup reducers
      .addCase(signup.pending, (state) => {
        state.signupLoading = true;
        state.signupError = null;
        state.signupSuccess = false;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<User>) => {
        state.signupLoading = false;
        state.signupSuccess = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupSuccess = false;
        state.signupError = action.payload?.detail || 'Signup failed';
      });
  },
});

// Auth header utility function
export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize auth header with token from localStorage on app load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthHeader(token);
  }
}

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectSignupSuccess = (state: { auth: AuthState }) => state.auth.signupSuccess;
export const selectSignupLoading = (state: { auth: AuthState }) => state.auth.signupLoading;
export const selectSignupError = (state: { auth: AuthState }) => state.auth.signupError;

export const { logout, clearError, clearSignupStatus } = authSlice.actions;
export default authSlice.reducer;