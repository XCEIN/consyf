"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode, useMemo } from "react";

interface NavLinkProps extends ComponentProps<"a"> {
  children: ReactNode;
  to: string;
  classNameEffect?: (isActive: boolean) => string;
}
export default function NavLink({
  children,
  to,
  classNameEffect,
  className,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = useMemo(() => {
    const to$ = to.startsWith("/") ? to : `/${to}`;
    return to$ === pathname;
  }, [to, pathname]);
  return (
    <Link
      href={to}
      {...props}
      className={cn(
        "group transition-colors duration-200",
        className,
        isActive ? "link-active" : "link-inactive",
        classNameEffect?.(isActive)
      )}
    >
      {children}
    </Link>
  );
}
