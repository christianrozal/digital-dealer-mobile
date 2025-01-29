import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  id: string | number;
  // Add other customer properties as needed
  [key: string]: any; // Allows for arbitrary customer properties
}

interface CustomerState {
  customersTabSelectedCustomer: Customer | null;
  activitiesTabSelectedCustomer: Customer | null;
}

const initialState: CustomerState = {
  customersTabSelectedCustomer: null,
  activitiesTabSelectedCustomer: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomersTabSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.customersTabSelectedCustomer = action.payload;
    },
    setActivitiesTabSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.activitiesTabSelectedCustomer = action.payload;
    },
      clearSelectedCustomers: (state) => {
          state.customersTabSelectedCustomer = null;
          state.activitiesTabSelectedCustomer = null;
      },
  },
});

export const { 
  setCustomersTabSelectedCustomer, 
  setActivitiesTabSelectedCustomer,
  clearSelectedCustomers 
} = customerSlice.actions;

export default customerSlice.reducer;