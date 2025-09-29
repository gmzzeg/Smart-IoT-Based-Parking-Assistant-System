import { User } from '@/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  token: string | null;
  userId?: number | null; 
  user: User | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  email: null,
  token: null,
  userId:null,
  user:null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedInUser: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.userId = action.payload.user.id;
    },
    login(state, action: PayloadAction<{ email: string; token?: string; userId?: number  }>) {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.userId = action.payload.userId ?? null; 
      if (action.payload.token) {
        state.token = action.payload.token;
      }
    },
    logout(state) {
      state.isLoggedIn = false;
      state.email = null;
      state.token = null;
      state.userId = null;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },
});

export const { login, logout, setToken,setLoggedInUser } = authSlice.actions;
export default authSlice.reducer;
