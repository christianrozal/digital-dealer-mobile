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
// Adding redux-persist imports
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Adding redux-persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist: [], // optionally specify which states to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// Export the persistor
export const persistor = persistStore(store);
export default store;