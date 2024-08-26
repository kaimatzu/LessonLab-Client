// src/features/webSocket/webSocketSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface WebSocketState {
  connected: boolean;
  transactionData: { status: string; id: string };
}

const initialState: WebSocketState = {
  connected: false,
  transactionData: { status: '', id: '' },
};

export const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    connectSocket: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setTransactionData: (state, action: PayloadAction<{ status: string; id: string }>) => {
      state.transactionData = action.payload;
    },
  },
});

export const { connectSocket, setTransactionData } = webSocketSlice.actions;

export const selectWebSocket = (state: RootState) => state.webSocket;

export default webSocketSlice.reducer;
