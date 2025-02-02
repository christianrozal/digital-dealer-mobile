import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DealershipLevel1 {
    $id: string;
    name: string;
}

interface DealershipLevel2 {
    $id: string;
    name: string;
    slug?: string;
}

interface DealershipLevel3 {
    $id: string;
    name: string;
    slug?: string;
    dealershipLevel2: DealershipLevel2;
}

interface Scan {
    $id: string;
    $createdAt: string;
    customers?: {
        id: string;
        name?: string;
        phone?: string;
        email?: string;
        profileImage?: string;
        interestStatus?: string;
        interestedIn?: string;
    };
    interestStatus?: string;
    interestedIn?: string;
    followUpDate?: string;
    scanCount?: number;
}

interface UserState {
    data: {
        $id?: string;
        name?: string;
        phone?: string;
        email?: string;
        position?: string;
        role?: string;
        profileImage?: string;
        profileImageId?: string;
        dealershipLevel1?: DealershipLevel1[];
        dealershipLevel2?: DealershipLevel2[];
        dealershipLevel3?: DealershipLevel3[];
        scans?: Scan[];
        slug?: string;
        customers?: string[];
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    data: null,
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserState['data']>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearUser: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { setUserData, setLoading, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
