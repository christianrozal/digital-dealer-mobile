// store.ts
import { configureStore, current } from '@reduxjs/toolkit';
import sidePaneReducer from './sidePaneSlice';
import uiReducer from './uiSlice';
import customerReducer from './customerSlice';
import rooftopReducer from './rooftopSlice';
import currentReducer from './currentSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    sidePane: sidePaneReducer,
    ui: uiReducer,
    customer: customerReducer,
    rooftop: rooftopReducer,
    current: currentReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;