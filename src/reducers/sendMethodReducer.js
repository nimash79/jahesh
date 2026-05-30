import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "send_method";
const storedSendMethod = AsyncStorage.getItem(STORAGE_KEY);
const initialState = storedSendMethod || "sms";

const sendMethodSlice = createSlice({
  name: "sendMethod",
  initialState: "sms",
  reducers: {
    changeSendMethod: (state, action) => action.payload,
  },
  extraReducers: builder => {
    builder.addCase(loadSendMethod.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const setSendMethod = method => async dispatch => {
  await AsyncStorage.setItem(STORAGE_KEY, method);
  dispatch(changeSendMethod(method));
};


export const loadSendMethod = createAsyncThunk(
  "sendMethod/load",
  async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored || "sms";
  }
);


export const { changeSendMethod } = sendMethodSlice.actions;

export default sendMethodSlice.reducer;
