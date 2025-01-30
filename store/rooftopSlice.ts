// rooftopSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RooftopState {
  selectedRooftopData: any | null; // Renamed to selectedRooftopData
}

const initialState: RooftopState = {
  selectedRooftopData: null, // Renamed to selectedRooftopData
};

export const rooftopSlice = createSlice({
  name: 'rooftop',
  initialState,
  reducers: {
    setSelectedRooftopData: (state, action: PayloadAction<any | null>) => { // Renamed action creator
      state.selectedRooftopData = action.payload; // Updated to use selectedRooftopData
    },
    resetSelectedRooftopData: (state) => { // Renamed action creator
      state.selectedRooftopData = null; // Updated to use selectedRooftopData
    },
  },
});

export const { setSelectedRooftopData, resetSelectedRooftopData } = rooftopSlice.actions; // Renamed action exports

export default rooftopSlice.reducer;