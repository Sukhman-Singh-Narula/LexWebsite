import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
// import docsReducer from '../features/docs/docsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
});

export default rootReducer;