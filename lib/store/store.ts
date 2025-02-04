// store.ts
import { configureStore } from '@reduxjs/toolkit';
import sidePaneReducer from './sidePaneSlice';
import uiReducer from './uiSlice';
import customerReducer from './customerSlice';
import currentReducer from './currentSlice';
import userReducer from './userSlice';
import consultantReducer from './consultantSlice';

const store = configureStore({
  reducer: {
    sidePane: sidePaneReducer,
    ui: uiReducer,
    customer: customerReducer,
    current: currentReducer,
    user: userReducer,
    consultant: consultantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;