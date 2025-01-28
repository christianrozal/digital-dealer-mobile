// store/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

interface UIState {
  isActivitiesFilterVisible: boolean;
  selectedInterestedIns: string[];
  selectedInterestStatuses: string[];
  sortBy: "follow_up_date" | "last_scanned" | null;
  fromDate: dayjs.Dayjs | null; // Added for date range
  toDate: dayjs.Dayjs | null; // Added for date range
}

const initialState: UIState = {
  isActivitiesFilterVisible: false,
  selectedInterestedIns: [],
  selectedInterestStatuses: [],
  sortBy: null,
  fromDate: null, // Initial state for fromDate
  toDate: null, // Initial state for toDate
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
      state.fromDate = null; // Reset fromDate
      state.toDate = null; // Reset toDate
    },
    setSortBy: (state, action: PayloadAction<UIState["sortBy"]>) => {
      state.sortBy = action.payload;
    },
    resetSortBy: (state) => {
      state.sortBy = null;
    },
    // New reducers for date range
    setFromDate: (state, action: PayloadAction<dayjs.Dayjs | null>) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action: PayloadAction<dayjs.Dayjs | null>) => {
      state.toDate = action.payload;
    },
    resetDateRange: (state) => {
      state.fromDate = null;
      state.toDate = null;
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
  setFromDate, // Export new actions
  setToDate, // Export new actions
  resetDateRange, // Export new action
} = uiSlice.actions;

export default uiSlice.reducer;