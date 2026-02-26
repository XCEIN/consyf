"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { persistStore } from "redux-persist";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authReducer } from "./slices";

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer(
  {
    key: "root",
    version: 1,
    storage,
    whitelist: ["auth"],
  },
  rootReducer
);
export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    });
  },
});
export const persistor = persistStore(store);
// Infer the type of makeStore
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export type UseAppDispatchType = ReturnType<typeof useAppDispatch>;
