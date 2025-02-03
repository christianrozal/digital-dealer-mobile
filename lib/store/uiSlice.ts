// store/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

interface UIState {
  isActivitiesFilterVisible: boolean;
  activitiesSelectedInterestedIns: string[];
  activitiesSelectedInterestStatuses: string[];
  activitiesSortBy: "a_to_z" | "z_to_a" | "scans_low_to_high" | "scans_high_to_low" | "last_scanned_newest_to_oldest" | "last_scanned_oldest_to_newest" | null;
  activitiesFromDate: string | null;
  activitiesToDate: string | null;

  isCustomersFilterVisible: boolean;
  customersSelectedInterestedIns: string[];
  customersSelectedInterestStatuses: string[];
  customersSortBy: "a_to_z" | "z_to_a" | "scans_low_to_high" | "scans_high_to_low" | "last_scanned_newest_to_oldest" | "last_scanned_oldest_to_newest" | null;
  customersFromDate: string | null;
  customersToDate: string | null;

  isAnalyticsFilterVisible: boolean;
  analyticsSelectedInterestedIns: string[];
  analyticsSelectedInterestStatuses: string[];
  analyticsSortBy: "a_to_z" | "z_to_a" | "scans_low_to_high" | "scans_high_to_low" | "last_scanned_newest_to_oldest" | "last_scanned_oldest_to_newest" | null;
  analyticsFromDate: string | null;
  analyticsToDate: string | null;
    
  customerUpdateSuccess: boolean;
}

const initialState: UIState = {
  isActivitiesFilterVisible: false,
  activitiesSelectedInterestedIns: [],
  activitiesSelectedInterestStatuses: [],
  activitiesSortBy: null,
  activitiesFromDate: null,
  activitiesToDate: null,

  isCustomersFilterVisible: false,
  customersSelectedInterestedIns: [],
  customersSelectedInterestStatuses: [],
  customersSortBy: null,
  customersFromDate: null,
  customersToDate: null,
    
  customerUpdateSuccess: false,

  // Analytics Filter Initial State
  isAnalyticsFilterVisible: false,
  analyticsSelectedInterestedIns: [],
  analyticsSelectedInterestStatuses: [],
  analyticsSortBy: null,
  analyticsFromDate: null,
  analyticsToDate: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Activities Filter Reducers
    showActivitiesFilter: (state) => {
      state.isActivitiesFilterVisible = true;
    },
    hideActivitiesFilter: (state) => {
      state.isActivitiesFilterVisible = false;
    },
    toggleActivitiesInterestedIn: (state, action: PayloadAction<string>) => {
      const index = state.activitiesSelectedInterestedIns.indexOf(action.payload);
      if (index >= 0) {
        state.activitiesSelectedInterestedIns.splice(index, 1);
      } else {
        state.activitiesSelectedInterestedIns.push(action.payload);
      }
    },
    toggleActivitiesInterestStatus: (state, action: PayloadAction<string>) => {
      const index = state.activitiesSelectedInterestStatuses.indexOf(action.payload);
      if (index >= 0) {
        state.activitiesSelectedInterestStatuses.splice(index, 1);
      } else {
        state.activitiesSelectedInterestStatuses.push(action.payload);
      }
    },
    resetActivitiesInterestedIns: (state) => {
      state.activitiesSelectedInterestedIns = [];
    },
    resetActivitiesInterestStatuses: (state) => {
      state.activitiesSelectedInterestStatuses = [];
    },
    resetAllActivitiesFilters: (state) => {
      state.activitiesSelectedInterestedIns = [];
      state.activitiesSelectedInterestStatuses = [];
      state.activitiesSortBy = null;
      state.activitiesFromDate = null;
      state.activitiesToDate = null;
    },
    setActivitiesSortBy: (state, action: PayloadAction<UIState["activitiesSortBy"]>) => {
      state.activitiesSortBy = action.payload;
    },
    resetActivitiesSortBy: (state) => {
      state.activitiesSortBy = null;
    },
    setActivitiesFromDate: (state, action: PayloadAction<string | null>) => {
      state.activitiesFromDate = action.payload;
    },
    setActivitiesToDate: (state, action: PayloadAction<string | null>) => {
      state.activitiesToDate = action.payload;
    },
     resetActivitiesDateRange: (state) => {
      state.activitiesFromDate = null;
      state.activitiesToDate = null;
    },

    // Customers Filter Reducers
    showCustomersFilter: (state) => {
      state.isCustomersFilterVisible = true;
    },
    hideCustomersFilter: (state) => {
      state.isCustomersFilterVisible = false;
    },
      toggleCustomersInterestedIn: (state, action: PayloadAction<string>) => {
        const index = state.customersSelectedInterestedIns.indexOf(action.payload);
        if (index >= 0) {
          state.customersSelectedInterestedIns.splice(index, 1);
        } else {
          state.customersSelectedInterestedIns.push(action.payload);
        }
      },
      toggleCustomersInterestStatus: (state, action: PayloadAction<string>) => {
        const index = state.customersSelectedInterestStatuses.indexOf(action.payload);
        if (index >= 0) {
          state.customersSelectedInterestStatuses.splice(index, 1);
        } else {
          state.customersSelectedInterestStatuses.push(action.payload);
        }
      },
    resetCustomersInterestedIns: (state) => {
      state.customersSelectedInterestedIns = [];
    },
    resetCustomersInterestStatuses: (state) => {
      state.customersSelectedInterestStatuses = [];
    },
    resetAllCustomersFilters: (state) => {
      state.customersSelectedInterestedIns = [];
      state.customersSelectedInterestStatuses = [];
      state.customersSortBy = null;
        state.customersFromDate = null;
        state.customersToDate = null;
    },
    setCustomersSortBy: (state, action: PayloadAction<UIState["customersSortBy"]>) => {
      state.customersSortBy = action.payload;
    },
      resetCustomersSortBy: (state) => {
          state.customersSortBy = null;
      },
    setCustomersFromDate: (state, action: PayloadAction<string | null>) => {
        state.customersFromDate = action.payload;
      },
    setCustomersToDate: (state, action: PayloadAction<string | null>) => {
        state.customersToDate = action.payload;
      },
    resetCustomersDateRange: (state) => {
        state.customersFromDate = null;
        state.customersToDate = null;
      },
      setCustomerUpdateSuccess: (state, action: PayloadAction<boolean>) => {
        state.customerUpdateSuccess = action.payload;
      },

    // Analytics Filter Reducers
    showAnalyticsFilter: (state) => {
      state.isAnalyticsFilterVisible = true;
    },
    hideAnalyticsFilter: (state) => {
      state.isAnalyticsFilterVisible = false;
    },
    setAnalyticsFromDate: (state, action: PayloadAction<string | null>) => {
      state.analyticsFromDate = action.payload;
    },
    setAnalyticsToDate: (state, action: PayloadAction<string | null>) => {
      state.analyticsToDate = action.payload;
    },
    resetAnalyticsDateRange: (state) => {
      state.analyticsFromDate = null;
      state.analyticsToDate = null;
    },
    resetAllAnalyticsFilters: (state) => {
      state.analyticsFromDate = null;
      state.analyticsToDate = null;
    },
  },
});

export const {
  showActivitiesFilter,
  hideActivitiesFilter,
  toggleActivitiesInterestedIn,
  toggleActivitiesInterestStatus,
  resetActivitiesInterestedIns,
  resetActivitiesInterestStatuses,
  resetAllActivitiesFilters,
  setActivitiesSortBy,
  resetActivitiesSortBy,
  setActivitiesFromDate,
  setActivitiesToDate,
  resetActivitiesDateRange,

  showCustomersFilter,
  hideCustomersFilter,
    toggleCustomersInterestedIn,
    toggleCustomersInterestStatus,
  resetCustomersInterestedIns,
  resetCustomersInterestStatuses,
  resetAllCustomersFilters,
  setCustomersSortBy,
  resetCustomersSortBy,
    setCustomersFromDate,
    setCustomersToDate,
    resetCustomersDateRange,
    setCustomerUpdateSuccess,

  // Analytics Filter Actions
  showAnalyticsFilter,
  hideAnalyticsFilter,
  setAnalyticsFromDate,
  setAnalyticsToDate,
  resetAnalyticsDateRange,
  resetAllAnalyticsFilters,
} = uiSlice.actions;

export default uiSlice.reducer;