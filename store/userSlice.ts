import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  name: string | null;
  isLoggedIn: boolean;
  customer: any | null;
}

const initialState: UserState = {
  email: null,
  name: null,
  isLoggedIn: false,
  customer: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ email: string, name: string }>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.email = null;
      state.name = null;
      state.isLoggedIn = false;
      state.customer = null; // Clear customer data as well
    },
    setCustomer: (state, action: PayloadAction<any>) => {
      state.customer = action.payload;
    },
    clearCustomer: (state) => {
      state.customer = null;
    },
  },
});

export const { setUser, clearUser, setCustomer, clearCustomer } = userSlice.actions;
export default userSlice.reducer;