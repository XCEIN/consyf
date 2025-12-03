import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
interface UserInfo {
  id: number;
  fullName: string;
}
export interface AuthState {
  userCurrent: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  userCurrent: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};
const fetchUserBySessionToken = createAsyncThunk(
  "auth/fetchUserBySessionToken",
  async (sessionToken: string, { rejectWithValue }) => {
    try {
      return Promise.resolve({
        id: 1,
        fullName: "Test",
      } as UserInfo);
    } catch (error) {
      rejectWithValue(error);
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<UserInfo | null>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
      state.userCurrent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBySessionToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBySessionToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
        state.userCurrent = action.payload!;
      })
      .addCase(fetchUserBySessionToken.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload);
      });
  },
});
export const {loginSuccess} = authSlice.actions;
export {fetchUserBySessionToken}
export default authSlice.reducer;
