import { createContext, use } from "react";

export interface WindowSizeReturn {
  width: number;
  height: number;
}
export const WindowSizeContext = createContext<WindowSizeReturn | null>(null);

const useWindowSize = (): WindowSizeReturn => {
  const ctx = use(WindowSizeContext);
  if (!ctx) {
    throw new Error("WindowSizeContext missing");
  }
  return ctx;
};
export default useWindowSize
