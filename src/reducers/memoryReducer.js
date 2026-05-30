import { createSlice } from "@reduxjs/toolkit";
import { createMem } from "../memory";

export const memorySlice = createSlice({
  name: "memory",
  initialState: createMem(),
  reducers: {
    getMemory: (state) => {
      return state;
    },
    updateMemory: (state, action) => {
      return action.payload;
    },
  },
});

export const { updateMemory } = memorySlice.actions;

export default memorySlice.reducer;
