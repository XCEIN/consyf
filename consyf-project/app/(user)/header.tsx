"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useState } from "react";
import NavLink from "@/components/shared/nav-link";
import Button from "@/components/commons/button";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Bell } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}
export const navItems: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Về chúng tôi", href: "/about-us" },
  { label: "Tin tức", href: "/news" },
  { label: "Bảng giá", href: "/price-list" },
  { label: "Khuyến mãi nhà đầu tư", href: "/promotion" },
];

export default function UserHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <header className={cn("", className)} {...props}>
      <div
        className={cn(
          "container mx-auto",
          "flex items-center justify-between h-20"
        )}
      >
        <div className={cn("flex items-center gap-8")}>
          {/* Logo  */}
          <Link href={"/"} className={cn("w-[42px] h-8")}>
            <Image
              alt="logo"
              src={"/images/icons/logo_trans_1.svg"}
              width={42}
              height={32}
              priority
            />
          </Link>
          {/* Nav  */}
          <nav className={cn("flex items-center gap-8 text-app-neutral-gray1")}>
            {navItems.map(({ href, label }) => {
              return (
                <NavLink
                  key={href}
                  to={href}
                  classNameEffect={(isActive) =>
                    cn("font-semibold", {
                      "": isActive,
                    })
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Actions button */}
        {!isLoggedIn ? (
          <div className={cn("flex items-center gap-3")}>
            <Link href={"/sign-up"} className="cursor-pointer">
              <Button
                variant={"ghost"}
                className="cursor-pointer text-app-neutral-gray1"
              >
                Đăng ký
              </Button>
            </Link>
            <Link href={"/sign-in"} className="cursor-pointer">
              <Button
                className={cn(
                  "bg-primary-bold hover:bg-primary-bold/90 cursor-pointer"
                )}
              >
                Đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <div className={cn("flex items-center gap-4 relative")}>
            {/* Notifications */}
            <Link href={"/profile?tab=notification"} className="relative">
              <Button variant={"ghost"} size={"icon"} className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant={"ghost"}
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{userName || "User"}</span>
              </Button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={"/profile"}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Trang cá nhân</span>
                    </div>
                  </Link>
                  {isAdmin && (
                    <Link
                      href={"/admin"}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Quản trị</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
