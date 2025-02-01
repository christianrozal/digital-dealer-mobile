// store/sidePaneSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ScreenState = 'main' | 'profile' | 'editProfile';

interface SidePaneState {
  currentScreen: ScreenState;
}

const initialState: SidePaneState = {
  currentScreen: 'main',
};

const sidePaneSlice = createSlice({
  name: 'sidePane',
  initialState,
  reducers: {
    setScreen: (state, action: PayloadAction<ScreenState>) => {
      state.currentScreen = action.payload;
    },
    resetScreen: (state) => {
      state.currentScreen = 'main';
    },
  },
});

export const { setScreen, resetScreen } = sidePaneSlice.actions;
export default sidePaneSlice.reducer;