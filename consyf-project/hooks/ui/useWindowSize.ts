"use client";
import { WindowSizeReturn } from "@/contexts/window-size.context";
import { useEffect, useState } from "react";

export default function useWindowSize(): WindowSizeReturn {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  const resizeHandle = () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, []);
  return {
    ...size,
  };
}
