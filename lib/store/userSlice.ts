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
    users?: string | { $id: string; name?: string; profileImage?: string; [key: string]: any };
    customers?: {
        $id: string;
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
    dealershipLevel1?: { $id: string };
    dealershipLevel2?: { $id: string };
    dealershipLevel3?: { $id: string };
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
        slug?: string;
        customers?: string[];
        scans?: Scan[];  
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
        addUserScan: (state, action: PayloadAction<Scan>) => {
            if (state.data) {
                state.data.scans = [...(state.data.scans || []), action.payload];
            }
        },
        updateUserScan: (state, action: PayloadAction<{ id: string; data: Partial<Scan> }>) => {
            if (state.data?.scans) {
                state.data.scans = state.data.scans.map(scan => 
                  scan.$id === action.payload.id 
                    ? { ...scan, ...action.payload.data }
                    : scan
                );
            }
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

export const { setUserData, setLoading, setError, clearUser, addUserScan, updateUserScan } = userSlice.actions;
export default userSlice.reducer;
