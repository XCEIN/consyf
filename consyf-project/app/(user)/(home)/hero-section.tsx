"use client";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import Image from "next/image";

interface Tag {
  title: string;
  color: string;
}
const tags: Tag[] = [
  {
    title: "Công nghệ thông tin",
    color: "border-green-600/50 text-green-700 bg-green-300/5",
  },
  {
    title: "Giáo dục",
    color: "border-yellow-600/50 text-yellow-700 bg-yellow-300/5",
  },
  {
    title: "Y tế",
    color: "border-red-600/50 text-red-700 bg-red-300/5",
  },
  {
    title: "Du lịch",
    color: "border-blue-600/50 text-blue-700 bg-blue-300/5",
  },
  {
    title: "Viên thông",
    color: "border-blue-600/50 text-blue-700 bg-blue-300/5",
  },
  {
    title: "Ẩm thực",
    color: "border-pink-600/50 text-pink-700 bg-pink-300/5",
  },
  {
    title: "Thời trang",
    color: "border-green-600/50 text-green-700 bg-green-300/5",
  },
];

export default function HeroSection() {
  return (
    <div
      className={cn(
        "container mx-auto",
        "flex flex-col lg:flex-row items-center justify-between gap-16",
        "py-12"
      )}
    >
      <div className={cn("flex-1 flex flex-col gap-[49px]")}>
        <div className="space-y-3">
          <h1 className={cn("text-3xl lg:text-5xl font-semibold text-center lg:text-left")}>
            Connect - Set your future
          </h1>
          <p className={cn("text-app-neutral-gray2 text-[14px] lg:text-[20px] text-center lg:text-left")}>
            Tìm kiếm đối tác nhanh chóng cùng Consyf
          </p>
        </div>
        <div>
          <div
            className={cn(
              "h-[68px] border border-app-neutral-gray3",
              "flex items-center px-4 rounded-4xl"
            )}
          >
            <input
              type="text"
              placeholder="Search for files, plugins, and creators"
              className="w-full outline-none border-app-neutral-gray4"
            />
            <button
              className={cn(
                "bg-app-blue w-[47px] h-[47px] rounded-full",
                "flex flex-col justify-center items-center",
                "text-white cursor-pointer"
              )}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {tags.map((tag, idx) => {
            return (
              <span
                key={idx}
                className={cn("px-4 py-2 rounded-4xl border", tag.color)}
              >
                {tag.title}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex-1 flex justify-end items-center w-full h-full">
        <Image
          alt="home1"
          src="/images/user/home/user_home1.svg"
          width={592}
          height={640}
        />
      </div>
    </div>
  );
}
