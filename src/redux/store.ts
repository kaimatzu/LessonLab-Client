import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import workspaceReducer from './slices/workspaceSlice';
import webSocketReducer from './slices/webSocketSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    workspace: workspaceReducer,
    webSocket: webSocketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
