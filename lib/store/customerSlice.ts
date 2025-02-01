import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  id: string | number;
  [key: string]: any;
}

interface CustomerState {
  selectedCustomer: Customer | null;
}

const initialState: CustomerState = {
  selectedCustomer: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
});

export const { 
  setSelectedCustomer,
  clearSelectedCustomer
} = customerSlice.actions;

export default customerSlice.reducer;