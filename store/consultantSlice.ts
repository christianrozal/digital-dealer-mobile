// store/consultantSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ConsultantState {
  data: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ConsultantState = {
  data: null,
  status: 'idle',
  error: null
};

const consultantSlice = createSlice({
  name: 'consultant',
  initialState,
  reducers: {
    setConsultant: (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    setLoading: (state) => {
      state.status = 'loading';
    }
  }
});

export const { setConsultant, setError, setLoading } = consultantSlice.actions;
export default consultantSlice.reducer;