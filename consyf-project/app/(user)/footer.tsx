"use client";

import Link from "next/link";
import { NavItem } from "./header";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Image from "next/image";
interface SocialItem {
  href: string;
  icon: string;
}
const navItems: NavItem[] = [
  { label: "Giới thiệu", href: "/about-us" },
  { label: "Tính năng", href: "/futures" },
  { label: "Gói dịch vụ", href: "/services" },
  { label: "Tuyển dụng", href: "/recruitment" },
  { label: "Hỗ trợ", href: "/support" },
  { label: "Chính sách bảo mật", href: "/privacy" },
];
const socialItems: SocialItem[] = [
  { href: "x", icon: "/images/icons/x.svg" },
  { href: "in", icon: "/images/icons/in.svg" },
  { href: "fb", icon: "/images/icons/fb.svg" },
  { href: "github", icon: "/images/icons/git.svg" },
];
const pathsHidden: string[] = ["/sign-in", "/sign-up", "/sign-up/verify"];
export default function UserFooter({
  className,
  ...props
}: ComponentProps<"footer">) {
  const pathname = usePathname();
  if (pathsHidden.includes(pathname)) {
    return null;
  }
  return (
    <footer
      {...props}
      className={cn("bg-app-neutral-gray7 pt-16 pb-12", className)}
    >
      <div className={cn("container mx-auto", "space-y-8")}>
        <div className={cn("max-w-[320px] space-y-8")}>
          <div className={cn("w-[180px] h-[68px]")}>
            <Image
              alt="logo_trans_2"
              src={"/images/icons/logo_trans_2.svg"}
              width={180}
              height={68}
              className="w-full h-full"
              priority
            />
          </div>
          <div>
            <p className="text-app-neutral-gray3">
              Kết nối nhà đầu tư với những ý tưởng khởi nghiệp táo bạo và đầy
              tiềm năng.
            </p>
          </div>
        </div>
        <div className={cn("pb-8")}>
          <nav className={cn("md:flex gap-8", "grid grid-cols-2")}>
            {navItems.map(({ href, label }) => {
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn("text-app-neutral-gray2", "font-semibold")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className={cn("container mx-auto")}>
        <div
          className={cn(
            "border-t border-t-app-neutral-gray5 pt-8",
            "flex flex-col lg:flex-row justify-between items-center gap-8"
          )}
        >
          <p className={cn("text-app-neutral-gray3", "order-2 lg:order-1")}>
            © 2025 CONSYF Capital Platform. All rights reserved.
          </p>
          <ul
            className={cn(
              "flex items-center justify-center gap-8 text-app-neutral-gray3",
              "order-1 lg:order-2"
            )}
          >
            {socialItems.map((soc) => {
              return (
                <li key={soc.href}>
                  <a href={soc.href} className="w-6 h-6">
                    <Image
                      alt={soc.href}
                      src={soc.icon}
                      width={24}
                      height={24}
                      priority
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
