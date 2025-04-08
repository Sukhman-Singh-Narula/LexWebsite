import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import casesReducer from '../features/cases/caseSlices';
// import docsReducer from '../features/docs/docsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cases: casesReducer,
});

export default rootReducer;