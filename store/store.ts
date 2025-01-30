// store.ts
import { configureStore, current } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import sidePaneReducer from './sidePaneSlice';
import consultantReducer from './consultantSlice';
import uiReducer from './uiSlice';
import customerReducer from './customerSlice';
import rooftopReducer from './rooftopSlice';
import currentReducer from './currentSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    sidePane: sidePaneReducer,
    consultant: consultantReducer,
    ui: uiReducer,
    customer: customerReducer,
    rooftop: rooftopReducer,
    current: currentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;