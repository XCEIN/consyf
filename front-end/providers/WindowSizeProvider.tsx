"use client";
import { WindowSizeContext } from "@/contexts/window-size.context";
import useWindowSize from "@/hooks/ui/useWindowSize";
import { ReactNode } from "react";

export default function WindowSizeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WindowSizeContext.Provider value={useWindowSize()}>
      {children}
    </WindowSizeContext.Provider>
  );
}
