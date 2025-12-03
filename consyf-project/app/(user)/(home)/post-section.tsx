"use client";

import PostCard from "@/components/shared/user/post-card";
import { cn } from "@/lib/utils";

export default function PostSection() {
  return (
    <div
      className={cn(
        "container mx-auto",
        "flex flex-col gap-16",
        "pb-12"
      )}
    >
      <h1 className="text-[40px] lg:text-5xl text-primary-bold font-medium">Bài viết</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {Array.from({ length: 6 }).map((_, index) => {
          return (
            <li key={index}>
              <PostCard />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
