import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import authReducer, { setAuthHeader } from '../features/auth/authSlice';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      auth: authReducer,
    }),
});

const token = localStorage.getItem('token');
if (token) {
  setAuthHeader(token);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;