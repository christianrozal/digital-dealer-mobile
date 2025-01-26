// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import sidePaneReducer from './sidePaneSlice';
import consultantReducer from './consultantSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    sidePane: sidePaneReducer,
    consultant: consultantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;