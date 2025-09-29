import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile,User } from '@/types/types';


interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  currentUser: User | null;
  updating: boolean;
  emailUpdating: boolean;
  passwordUpdating: boolean;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  currentUser:null,
  updating: false,
  emailUpdating: false,
  passwordUpdating: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileStart(state) {
      state.updating = true;
      state.error = null;
    },
    updateProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.updating = false;
      state.profile = action.payload;
    },
    updateProfileFailure(state, action: PayloadAction<string>) {
      state.updating = false;
      state.error = action.payload;
    },
     updateCurrentUser: (state, action: PayloadAction<User>) => {
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload;
      }
    },
    // 👇 Email güncelleme
    updateEmailStart(state) {
      state.emailUpdating = true;
      state.error = null;
    },
    updateEmailSuccess(state, action: PayloadAction<string>) {
      state.emailUpdating = false;
      if (state.profile) {
        state.profile.email = action.payload;
      }
    },
    updateEmailFailure(state, action: PayloadAction<string>) {
      state.emailUpdating = false;
      state.error = action.payload;
    },

    // 👇 Şifre güncelleme
    updatePasswordStart(state) {
      state.passwordUpdating = true;
      state.error = null;
    },
    updatePasswordSuccess(state) {
      state.passwordUpdating = false;
    },
    updatePasswordFailure(state, action: PayloadAction<string>) {
      state.passwordUpdating = false;
      state.error = action.payload;
    },

    clearProfile(state) {
      state.profile = null;
      state.error = null;
      state.loading = false;
      state.updating = false;
      state.emailUpdating = false;
      state.passwordUpdating = false;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  updateEmailStart,
  updateEmailSuccess,
  updateEmailFailure,
  updatePasswordStart,
  updatePasswordSuccess,
  updateCurrentUser,
  updatePasswordFailure,
  clearProfile,
} = userSlice.actions;

export default userSlice.reducer;
