'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import UserHeader from "../(user)/header";
import UserHeaderMobile from "../(user)/header-mobile";
import useModal from "@/hooks/ui/useModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { open, close, isOpen: isOnTop } = useModal(false);

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/sign-in');
      return;
    }
    
    const userData = JSON.parse(user);
    const isAdmin = userData.account_type === 'admin' || userData.account_type === 'editor' || userData.role === 'admin';
    if (!isAdmin) {
      alert('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }
  }, [router]);

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
  }, [open, close]);

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
    </section>
  );
}
