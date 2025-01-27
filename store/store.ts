// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import sidePaneReducer from './sidePaneSlice';
import consultantReducer from './consultantSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    sidePane: sidePaneReducer,
    consultant: consultantReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;