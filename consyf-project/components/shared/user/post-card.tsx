"use client";

import Image from "next/image";
import ImageIcon from "../image-icon";

export default function PostCard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="w-full h-60 overflow-hidden border-[0.5px] rounded-2xl shadow-xs">
        <Image
          alt="img"
          src={"/images/bg/imgdemo.svg"}
          width={240}
          height={240}
          className="w-full min-h-60 object-cover bg-primary-bold/50"
        />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-sm font-semibold text-purple-800">
              Design
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-semibold">
                Prototype nhanh để demo gọi vốn
              </h1>
              <div className="min-w-6 cursor-pointer">
                <ImageIcon src="/arrow_top_right.svg" size={24} />
              </div>
            </div>
            <p className="text-app-neutral-gray3 text-ellipsis line-clamp-2">
              Tạo prototype đơn giản nhưng hiệu quả giúp nhà đầu tư hiểu rõ sản
              phẩm ngay lập tức.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full"></div>
          <div>
            <h2 className="text-sm font-semibold">Olivia Rhye</h2>
            <p className="text-sm font-normal text-app-neutral-gray3">
              20/08/2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
