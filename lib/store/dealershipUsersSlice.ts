import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  $id: string;
  name: string;
  profileImage?: string;
}

interface DealershipUsersState {
  data: User[];
  loading: boolean;
  error: string | null;
}

const initialState: DealershipUsersState = {
  data: [],
  loading: false,
  error: null
};

const dealershipUsersSlice = createSlice({
  name: 'dealershipUsers',
  initialState,
  reducers: {
    setDealershipUsers(state, action: PayloadAction<User[]>) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearDealershipUsers(state) {
      state.data = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setDealershipUsers, setLoading, setError, clearDealershipUsers } = dealershipUsersSlice.actions;
export default dealershipUsersSlice.reducer;
