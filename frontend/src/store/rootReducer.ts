import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import casesReducer from '../features/cases/caseSlices';
import clientsReducer from '../features/clients/clientSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cases: casesReducer,
  clients: clientsReducer,
});

export default rootReducer;