"use client";
import { cn } from "@/lib/utils";
import UserHeader from "./header";
import UserFooter from "./footer";
import UserHeaderMobile from "./header-mobile";
import useModal from "@/hooks/ui/useModal";
import { useEffect } from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { open, close, isOpen: isOnTop } = useModal(false);
  useEffect(() => {
    const offsetHandle = () => {
      if (window.pageYOffset > 80) {
        open();
      } else {
        close();
      }
    };
    offsetHandle();
    window.addEventListener("scroll", offsetHandle);
    return () => {
      window.removeEventListener("scroll", offsetHandle);
    };
  }, []);
  return (
    <section className={cn("min-w-screen bg-transparent")}>
      <UserHeader
        className={cn(
          "hidden lg:block sticky top-0 bg-white/10 backdrop-blur-3xl z-50",
          {
            shadow: isOnTop,
          }
        )}
      />
      <UserHeaderMobile
        className={cn(
          "sticky top-0 bg-white/10 backdrop-blur-3xl block lg:hidden",
          {
            shadow: isOnTop,
          }
        )}
      />
      <main className="min-w-screen overflow-x-hidden">{children}</main>
      <UserFooter />
    </section>
  );
}
