// store/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isActivitiesFilterVisible: boolean;
  selectedInterestedIns: string[];
  selectedInterestStatuses: string[];
  sortBy: 'follow_up_date' | 'last_scanned' | null;
}

const initialState: UIState = {
  isActivitiesFilterVisible: false,
  selectedInterestedIns: [],
  selectedInterestStatuses: [],
  sortBy: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showActivitiesFilter: (state) => {
      state.isActivitiesFilterVisible = true;
    },
    hideActivitiesFilter: (state) => {
      state.isActivitiesFilterVisible = false;
    },
    toggleInterestedIn: (state, action: PayloadAction<string>) => {
      const index = state.selectedInterestedIns.indexOf(action.payload);
      if (index >= 0) {
        state.selectedInterestedIns.splice(index, 1);
      } else {
        state.selectedInterestedIns.push(action.payload);
      }
    },
    toggleInterestStatus: (state, action: PayloadAction<string>) => {
      const index = state.selectedInterestStatuses.indexOf(action.payload);
      if (index >= 0) {
        state.selectedInterestStatuses.splice(index, 1);
      } else {
        state.selectedInterestStatuses.push(action.payload);
      }
    },
    resetInterestedIns: (state) => {
      state.selectedInterestedIns = [];
    },
    resetInterestStatuses: (state) => {
      state.selectedInterestStatuses = [];
    },
    resetAllFilters: (state) => {
      state.selectedInterestedIns = [];
      state.selectedInterestStatuses = [];
      state.sortBy = null;
    },
    setSortBy: (state, action: PayloadAction<UIState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    resetSortBy: (state) => {
      state.sortBy = null;
    },
  },
});

export const {
  showActivitiesFilter,
  hideActivitiesFilter,
  toggleInterestedIn,
  toggleInterestStatus,
  resetInterestedIns,
  resetInterestStatuses,
  resetAllFilters,
  setSortBy,
  resetSortBy,
} = uiSlice.actions;

export default uiSlice.reducer;