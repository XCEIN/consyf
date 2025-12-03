"use client";
import useWindowSize from "@/contexts/window-size.context";
import { ComponentProps, ReactNode } from "react";
import ImageIcon from "../image-icon";
import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";

export default function ButtonEdit({
  onClick,
  children,
  className,
  penClassName,
}: {
  onClick: () => void;
  children: ReactNode;
  penClassName?: string;
} & ComponentProps<"button">) {
  const { width } = useWindowSize();
  if (width < 1024) {
    return (
      <button className={cn(className, penClassName)} onClick={onClick}>
        <ImageIcon src="pen.svg" size={20} alt="penedit" />
      </button>
    );
  }
  return (
    <Button
      onClick={onClick}
      variant={"outline"}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </Button>
  );
}
