"use client";
import { persistor, store } from "@/lib/redux/store";
import WindowSizeProvider from "@/providers/WindowSizeProvider";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <WindowSizeProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </WindowSizeProvider>
  );
}
