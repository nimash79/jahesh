import { configureStore } from '@reduxjs/toolkit';
import sendMethodReducer from '../reducers/sendMethodReducer';
import memoryReducer from '../reducers/memoryReducer';
import connectionReducer from '../reducers/connectionReducer';

export const store = configureStore({
  reducer: {
    sendMethod: sendMethodReducer,
    memory: memoryReducer,
    connection: connectionReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// store.subscribe(() => console.log(store.getState()));
