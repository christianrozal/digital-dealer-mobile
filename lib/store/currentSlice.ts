// currentSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CurrentState {
  currentDealershipLevel2: string | null;
  currentDealershipLevel3: string | null;
  currentConsultant: string | null;
  currentCustomer: string | null;
  currentScan: string | null;
}

const initialState: CurrentState = {
  currentDealershipLevel2: null,
  currentDealershipLevel3: null,
  currentConsultant: null,
  currentCustomer: null,
  currentScan: null,
};

export const currentSlice = createSlice({
  name: 'current',
  initialState,
  reducers: {
    setCurrentDealershipLevel2: (state, action: PayloadAction<string | null>) => {
      state.currentDealershipLevel2 = action.payload;
    },
    resetCurrentDealershipLevel2: (state) => {
      state.currentDealershipLevel2 = null;
    },
    setCurrentDealershipLevel3: (state, action: PayloadAction<string | null>) => {
      state.currentDealershipLevel3 = action.payload;
    },
    resetCurrentDealershipLevel3: (state) => {
      state.currentDealershipLevel3 = null;
    },
    setCurrentConsultant: (state, action: PayloadAction<string | null>) => {
      state.currentConsultant = action.payload;
    },
    resetCurrentConsultant: (state) => {
      state.currentConsultant = null;
    },
    setCurrentCustomer: (state, action: PayloadAction<string | null>) => {
      state.currentCustomer = action.payload;
    },
    resetCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    setCurrentScan: (state, action: PayloadAction<string | null>) => {
      state.currentScan = action.payload;
    },
    resetCurrentScan: (state) => {
      state.currentScan = null;
    },
    resetCurrentAll: (state) => {
      state.currentDealershipLevel2 = null;
      state.currentDealershipLevel3 = null;
      state.currentConsultant = null;
      state.currentCustomer = null;
      state.currentScan = null;
    },
  },
});

export const {
  setCurrentDealershipLevel2,
  resetCurrentDealershipLevel2,
  setCurrentDealershipLevel3,
  resetCurrentDealershipLevel3,
  setCurrentConsultant,
  resetCurrentConsultant,
  setCurrentCustomer,
  resetCurrentCustomer,
  setCurrentScan,
  resetCurrentScan,
  resetCurrentAll,
} = currentSlice.actions;

export default currentSlice.reducer;