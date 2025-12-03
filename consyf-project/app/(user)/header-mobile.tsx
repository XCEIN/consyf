"use client";

import useModal from "@/hooks/ui/useModal";
import { cn } from "@/lib/utils";
import { X, User, LogOut, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ComponentProps, useEffect, useState } from "react";
import { navItems } from "./header";
import NavLink from "@/components/shared/nav-link";
import Button from "@/components/commons/button";

export default function UserHeaderMobile({
  className,
  ...props
}: ComponentProps<"header">) {
  const { isOpen, toggle } = useModal(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Get user info from API or localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name);
        setIsAdmin(user.role === 'admin');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    toggle();
    window.location.href = "/";
  };

  return (
    <header {...props} className={cn("relative z-50", className)}>
      <div className={cn("flex items-center justify-between px-4 h-20", {})}>
        <div className="flex items-center gap-3">
          <Link href={"/"} className={cn("w-[42px] h-8")}>
            <Image
              alt="logo"
              src={"/images/icons/logo_trans_1.svg"}
              width={37}
              height={33}
              priority
            />
          </Link>
          <h1 className="font-semibold text-2xl">CONSYF</h1>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <Link href={"/profile?tab=notification"}>
              <Button variant={"ghost"} size={"icon"} className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </Link>
          )}
          <button className="cursor-pointer" onClick={toggle}>
            {isOpen ? (
              <X className="w-8 h-8 text-app-neutral-gray3" />
            ) : (
              <Image
                alt="menu"
                src={"/images/icons/menu.svg"}
                width={40}
                height={40}
                priority
              />
            )}
          </button>
        </div>
      </div>
      {/* Menu  */}
      <div
        className={cn(
          "absolute w-full bg-white",
          "transition-transform duration-300",
          "pb-8 h-[calc(100vh-80px)] overflow-y-auto",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          }
        )}
      >
        <nav className={cn("text-app-neutral-gray1", "flex flex-col gap-2")}>
          {navItems.map(({ href, label }) => {
            return (
              <NavLink
                onClick={toggle}
                key={href}
                to={href}
                classNameEffect={(isActive) =>
                  cn("p-4", {
                    "font-bold ": isActive,
                  })
                }
              >
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div className="w-full px-4">
          <div
            className={cn(
              "flex flex-col gap-4 pt-4",
              "border-t border-t-app-neutral-gray5"
            )}
          >
            {!isLoggedIn ? (
              <>
                <Link onClick={toggle} href={"/sign-up"} className="cursor-pointer">
                  <Button
                    variant={"secondary"}
                    className="text-app-neutral-gray1 w-full"
                  >
                    Đăng ký
                  </Button>
                </Link>
                <Link onClick={toggle} href={"/sign-in"} className="cursor-pointer">
                  <Button className={cn("bg-primary-bold w-full")}>
                    Đăng nhập
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-10 h-10 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{userName || "User"}</p>
                      <p className="text-sm text-gray-500">Xin chào!</p>
                    </div>
                  </div>
                </div>
                <Link onClick={toggle} href={"/profile"} className="cursor-pointer">
                  <Button variant={"secondary"} className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Trang cá nhân
                  </Button>
                </Link>
                {isAdmin && (
                  <Link onClick={toggle} href={"/admin"} className="cursor-pointer">
                    <Button variant={"secondary"} className="w-full justify-start">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Quản trị
                    </Button>
                  </Link>
                )}
                <Button 
                  variant={"ghost"} 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
