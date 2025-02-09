import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScanState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ScanState = {
  data: [],
  loading: false,
  error: null
};

export const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    setScans: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
    },
    addScan: (state, action: PayloadAction<any>) => {
      state.data.unshift(action.payload);
    },
    updateScan: (state, action: PayloadAction<{id: string; data: any}>) => {
      const index = state.data.findIndex(s => s.$id === action.payload.id);
      if(index !== -1) {
        state.data[index] = {...state.data[index], ...action.payload.data};
      }
    },
    setScanLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setScanError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setScans, addScan, updateScan, setScanLoading, setScanError } = scanSlice.actions;
export default scanSlice.reducer;
