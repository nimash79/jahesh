import { configureStore } from '@reduxjs/toolkit';
import sendMethodReducer from '../reducers/sendMethodReducer';
import memoryReducer from '../reducers/memoryReducer';

export const store = configureStore({
  reducer: {
    sendMethod: sendMethodReducer,
    memory: memoryReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// store.subscribe(() => console.log(store.getState()));
