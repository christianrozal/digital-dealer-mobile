// currentSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CurrentState {
  currentRooftop: string | null; // Now string | null for IDs
  currentConsultant: string | null; // Now string | null for IDs
  currentCustomer: string | null; // Now string | null for IDs
  currentScan: string | null; // New state for currentScan ID
}

const initialState: CurrentState = {
  currentRooftop: null,
  currentConsultant: null,
  currentCustomer: null,
  currentScan: null, // Initialize currentScan to null
};

export const currentSlice = createSlice({
  name: 'current',
  initialState,
  reducers: {
    setCurrentRooftop: (state, action: PayloadAction<string | null>) => { // PayloadAction<string | null>
      state.currentRooftop = action.payload;
    },
    resetCurrentRooftop: (state) => {
      state.currentRooftop = null;
    },
    setCurrentConsultant: (state, action: PayloadAction<string | null>) => { // PayloadAction<string | null>
      state.currentConsultant = action.payload;
    },
    resetCurrentConsultant: (state) => {
      state.currentConsultant = null;
    },
    setCurrentCustomer: (state, action: PayloadAction<string | null>) => { // PayloadAction<string | null>
      state.currentCustomer = action.payload;
    },
    resetCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    setCurrentScan: (state, action: PayloadAction<string | null>) => { // New reducer for currentScan
      state.currentScan = action.payload;
    },
    resetCurrentScan: (state) => { // New reducer to reset currentScan
      state.currentScan = null;
    },
    resetCurrentAll: (state) => { // Optional: Reducer to reset all current states
      state.currentRooftop = null;
      state.currentConsultant = null;
      state.currentCustomer = null;
      state.currentScan = null; // Reset currentScan in resetAll as well
    },
  },
});

export const {
  setCurrentRooftop,
  resetCurrentRooftop,
  setCurrentConsultant,
  resetCurrentConsultant,
  setCurrentCustomer,
  resetCurrentCustomer,
  setCurrentScan, // Export the new setCurrentScan action
  resetCurrentScan, // Export the new resetCurrentScan action
  resetCurrentAll, // Export the resetAll action as well
} = currentSlice.actions;

export default currentSlice.reducer;