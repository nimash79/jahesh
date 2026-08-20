import { createSlice } from "@reduxjs/toolkit";

const MEMORY_SIZE = 162;

const initialState = {
  bytes: new Uint8Array(MEMORY_SIZE),
};

export const memorySlice = createSlice({
  name: "memory",

  initialState,

  reducers: {
    clearMemory: (state) => {
      state.bytes = new Uint8Array(MEMORY_SIZE);
    },

    loadMemory: (state, action) => {
      state.bytes = new Uint8Array(action.payload);
    },
  },
});

export const {
  clearMemory,
  loadMemory,
} = memorySlice.actions;

export default memorySlice.reducer;