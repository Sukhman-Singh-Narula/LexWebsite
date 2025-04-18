// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import casesReducer from '../features/cases/caseSlices';
import clientsReducer from '../features/clients/clientSlice';
import documentsReducer from '../features/docs/docsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cases: casesReducer,
  clients: clientsReducer,
  documents: documentsReducer,
});

export default rootReducer;