import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";


const connectionSlice = createSlice({
  name: "connection",
  initialState: "disconnected",
  reducers: {
    changeConnection: (state, action) => action.payload,
  },
});



export const { changeConnection } = connectionSlice.actions;

export default connectionSlice.reducer;
