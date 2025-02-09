// lib/store/commentSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Comment {
  $id: string;
  comment: string;
  users: {
    name: string;
    email: string;
    $id: string;
    profileImage?: string;
  };
  customers: string;
  $createdAt: string;
}

interface CommentState {
  data: Comment[];
  loading: boolean;
}

const initialState: CommentState = {
  data: [],
  loading: false,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    setComments(state, action: PayloadAction<Comment[]>) {
      state.data = action.payload;
    },
    addComment(state, action: PayloadAction<Comment>) {
      state.data.unshift(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setComments, addComment, setLoading } = commentSlice.actions;
export default commentSlice.reducer;