// currentSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CurrentState {
  currentDealershipLevel1Id: string | null;
  currentDealershipLevel2Id: string | null;
  currentDealershipLevel3Id: string | null;
  currentUserId: string | null;
  currentCustomerId: string | null;
  currentScanId: string | null;
}

const initialState: CurrentState = {
  currentDealershipLevel1Id: null,
  currentDealershipLevel2Id: null,
  currentDealershipLevel3Id: null,
  currentUserId: null,
  currentCustomerId: null,
  currentScanId: null,
};

export const currentSlice = createSlice({
  name: 'current',
  initialState,
  reducers: {
    setCurrentDealershipLevel1Id: (state, action: PayloadAction<string | null>) => {
      state.currentDealershipLevel1Id = action.payload;
    },
    resetCurrentDealershipLevel1Id: (state) => {
      state.currentDealershipLevel1Id = null;
    },
    setCurrentDealershipLevel2Id: (state, action: PayloadAction<string | null>) => {
      state.currentDealershipLevel2Id = action.payload;
    },
    resetCurrentDealershipLevel2Id: (state) => {
      state.currentDealershipLevel2Id = null;
    },
    setCurrentDealershipLevel3Id: (state, action: PayloadAction<string | null>) => {
      state.currentDealershipLevel3Id = action.payload;
    },
    resetCurrentDealershipLevel3Id: (state) => {
      state.currentDealershipLevel3Id = null;
    },
    setCurrentUserId: (state, action: PayloadAction<string | null>) => {
      state.currentUserId = action.payload;
    },
    resetCurrentUserId: (state) => {
      state.currentUserId = null;
    },
    setCurrentCustomerId: (state, action: PayloadAction<string | null>) => {
      state.currentCustomerId = action.payload;
    },
    resetCurrentCustomerId: (state) => {
      state.currentCustomerId = null;
    },
    setCurrentScanId: (state, action: PayloadAction<string | null>) => {
      state.currentScanId = action.payload;
    },
    resetCurrentScanId: (state) => {
      state.currentScanId = null;
    },
    resetCurrentAll: (state) => {
      state.currentDealershipLevel1Id = null;
      state.currentDealershipLevel2Id = null;
      state.currentDealershipLevel3Id = null;
      state.currentUserId = null;
      state.currentCustomerId = null;
      state.currentScanId = null;
    },
  },
});

export const {
  setCurrentDealershipLevel1Id,
  resetCurrentDealershipLevel1Id,
  setCurrentDealershipLevel2Id,
  resetCurrentDealershipLevel2Id,
  setCurrentDealershipLevel3Id,
  resetCurrentDealershipLevel3Id,
  setCurrentUserId,
  resetCurrentUserId,
  setCurrentCustomerId,
  resetCurrentCustomerId,
  setCurrentScanId,
  resetCurrentScanId,
  resetCurrentAll,
} = currentSlice.actions;

export default currentSlice.reducer;