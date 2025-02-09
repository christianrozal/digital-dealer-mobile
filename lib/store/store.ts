// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import sidePaneReducer from './sidePaneSlice';
import uiReducer from './uiSlice';
import rooftopReducer from './rooftopSlice';
import currentReducer from './currentSlice';
import userReducer from './userSlice';
import consultantReducer from './consultantSlice';
import commentReducer from './commentSlice';
import dealershipUsersReducer from './dealershipUsersSlice';
import scanReducer from './scanSlice';
import notificationsReducer from './notificationsSlice';
const rootReducer = combineReducers({
  sidePane: sidePaneReducer,
  ui: uiReducer,
  rooftop: rooftopReducer,
  current: currentReducer,
  user: userReducer,
  consultant: consultantReducer,
  comment: commentReducer,
  dealershipUsers: dealershipUsersReducer,
  scan: scanReducer,
  notifications: notificationsReducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;