import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setAuthHeader } from '../features/auth/authSlice';

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// Initialize auth headers on app start
const token = localStorage.getItem('token');
if (token) {
  setAuthHeader(token);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;