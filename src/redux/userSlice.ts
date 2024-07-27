import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import { POST as autoLogin } from '@/app/api/auth/auto-login/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as register } from '@/app/api/auth/register/route';
import Cookies from 'js-cookie';
import RequestBuilder from '@/lib/hooks/builders/request-builder';

export interface User {
  userId: string;
  userType: 'STUDENT' | 'TEACHER';
  name: string;
  email: string;
  tokens: number;
}

export interface UserState {
  user: User | null;
  error: string | null;
  loading: boolean;
  isTransactionFinished: boolean;
  transactionStatus: string;
}

const initialState: UserState = {
  user: null,
  error: null,
  loading: false,
  isTransactionFinished: false,
  transactionStatus: '',
};

export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { responseData, success } = await autoLogin(); // May return an AuthResponse or an error string
      if (success && responseData && responseData.user) {
        return responseData.user;
      } else {
        return rejectWithValue('Authentication failed');
      }
    } catch (error: any) {
      return rejectWithValue(error.toString());
    }
  }
);

export const loginUser = createAsyncThunk<User, FormData, { rejectValue: string }>(
  'user/loginUser',
  async (formData, { rejectWithValue }) => {
    try {
      const requestBuilder = new RequestBuilder().setBody(formData);
      const response = await login(requestBuilder);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const responseData = await response.json();
      return responseData.user;
    } catch (error: any) {
      return rejectWithValue(error.toString());
    }
  }
);

export const registerUser = createAsyncThunk<User, FormData, { rejectValue: string }>(
  'user/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const requestBuilder = new RequestBuilder().setBody(formData);
      const response = await register(requestBuilder);
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
      const responseData = await response.json();
      return responseData.user;
    } catch (error: any) {
      return rejectWithValue(error.toString());
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
      Cookies.remove('authToken');
    },
    setIsTransactionFinished: (state, action: PayloadAction<boolean>) => {
      state.isTransactionFinished = action.payload;
    },
    setTransactionStatus: (state, action: PayloadAction<string>) => {
      state.transactionStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, setIsTransactionFinished, setTransactionStatus } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsTransactionFinished = (state: RootState) => state.user.isTransactionFinished;
export const selectTransactionStatus = (state: RootState) => state.user.transactionStatus;
export const selectLoading = (state: RootState) => state.user.loading;
export const selectError = (state: RootState) => state.user.error;

export default userSlice.reducer;
