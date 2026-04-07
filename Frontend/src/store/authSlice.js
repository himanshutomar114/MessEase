import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  code: null,
  isBlocked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setIsBlocked: (state, action) => {
      state.isBlocked = action.payload;
    },
  },
});

export const { setUser, logout, setLoading, setError, setCode, setIsBlocked } =
  authSlice.actions;
export default authSlice.reducer;
