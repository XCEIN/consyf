"use client";

import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";

type Field =
  | "Thời trang"
  | "Môi trường"
  | "Ẩm thực"
  | "Công nghệ – Kỹ thuật"
  | "Giáo dục"
  | "Kinh doanh"
  | "Nông – Lâm – Ngư nghiệp";

type AccountRole =
  | "Giám đốc công nghệ"
  | "Giám đốc tài chính"
  | "Giám đốc marketing"
  | "Giám đốc vận hành"
  | "Giám đốc sản phẩm"
  | "Giám đốc chiến lược"
  | "Giám đốc đổi mới";

type PartnerType =
  | "Đối tác công nghệ"
  | "Đối tác chiến lược"
  | "Đối tác phân phối"
  | "Đối tác bán hàng"
  | "Đối tác tiếp thị"
  | "Đối tác sản xuất"
  | "Đối tác thương mại điện tử";
type AccountType = "personal" | "investor" | "partner";
export interface ProjectData {
  account: {
    fullName: string;
    accountType: AccountType;
    accountRole: AccountRole;
  };
  project: {
    name: string;
    field: Field[];
    website: string;
    email: string;
    address: string;
    createdDate: string;
    description: string;
    mobilizedCapital: number;
    mobilizedCapitalUnit: "USD" | "VND";
    coFounder: AccountRole[];
    partner: PartnerType[];
  };
}
interface ProjectCardProps {
  data?: ProjectData;
  post?: {
    id: number;
    title: string;
    description: string;
    category: string;
    type: 'buy' | 'sell';
    budget: number | null;
    location: string | null;
    tags: string | null;
    created_at: string;
    company_name?: string;
    user_name?: string;
    user_avatar?: string;
    account_type?: string;
    post_image?: string;
    description_images?: string;
  };
}

const data: ProjectData = {
  account: {
    fullName: "Olivia Rhye",
    accountType: "personal",
    accountRole: "Giám đốc công nghệ",
  },
  project: {
    name: "EcoWear – Thời trang bền vững, thân thiện môi trường",
    field: ["Môi trường", "Thời trang"],
    website: "",
    email: "",
    address: "Tp.HCM, Việt Nam",
    createdDate: "12/03/2025",
    description:
      "Mặc đẹp, sống xanh. Chúng tôi mang đến thời trang làm từ chất liệu sinh thái, giúp bạn thể hiện phong cách mà vẫn bảo vệ hành tinh.Mặc đẹp, sống xanh. Chúng tôi mang đến thời trang làm từ chất liệu sinh thái, giúp bạn thể hiện phong cách mà vẫn bảo vệ hành tinh.",
    mobilizedCapital: 2000,
    mobilizedCapitalUnit: "USD",
    coFounder: ["Giám đốc công nghệ", "Giám đốc tài chính"],
    partner: ["Đối tác chiến lược"],
  },
};
const AccountTypeBadge: FC<{ accountType: string }> = ({
  accountType,
}) => {
  if (accountType === "personal") {
    return (
      <span className="px-3 py-1 rounded-4xl border border-green-300 bg-green-200/20 text-green-800 text-[14px]">
        Cá Nhân
      </span>
    );
  }
  if (accountType === "organization") {
    return (
      <span className="px-3 py-1 rounded-4xl border border-blue-300 bg-blue-200/20 text-blue-800 text-[14px]">
        Tổ Chức
      </span>
    );
  }
  // Fallback for old types
  if (accountType === "partner") {
    return (
      <span className="px-3 py-1 rounded-4xl border border-blue-300 bg-blue-200/20 text-blue-800 text-[14px]">
        Tổ Chức
      </span>
    );
  }
  if (accountType === "investor") {
    return (
      <span className="px-3 py-1 rounded-4xl border border-blue-300 bg-blue-200/20 text-blue-800 text-[14px]">
        Tổ Chức
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-4xl border border-green-300 bg-green-200/20 text-green-800 text-[14px]">
      Cá Nhân
    </span>
  );
};
export default function ProjectCard({ data: propData, post }: ProjectCardProps) {
  // Use post data if provided, otherwise use default data
  const displayData = post ? {
    account: {
      fullName: post.user_name || post.company_name || 'Anonymous',
      accountType: (post as any).account_type || 'personal',
      accountRole: 'Giám đốc công nghệ' as AccountRole,
    },
    project: {
      name: post.title,
      field: [post.category] as Field[],
      website: '',
      email: '',
      address: post.location || 'Việt Nam',
      createdDate: new Date(post.created_at).toLocaleDateString('vi-VN'),
      description: post.description,
      mobilizedCapital: post.budget || 0,
      mobilizedCapitalUnit: 'VND' as const,
      coFounder: [],
      partner: [],
    },
  } : propData || data;

  return (
    <div
      className={cn(
        "px-4 py-3",
        "border shadow-xs rounded-xl",
        "flex flex-col gap-5"
      )}
    >
      
      {/* Header  */}
      <div className={cn("flex justify-between items-start", "pb-2 border-b")}>
        <div className={cn("flex gap-3 items-center justify-center")}>
          {/* Avatar  */}
          <div className="w-12 h-12 bg-amber-50 rounded-full shadow-xs border overflow-hidden flex items-center justify-center">
            {(() => {
              // Nếu là tổ chức và có post_image thì dùng post_image
              if (post?.account_type === 'organization' && post?.post_image) {
                return <img src={post.post_image} alt="project" className="w-full h-full object-cover" />;
              }
              // Nếu là cá nhân hoặc không có post_image thì dùng user_avatar
              if (post?.user_avatar) {
                return <img src={post.user_avatar} alt="avatar" className="w-full h-full object-cover" />;
              }
              // Fallback
              return <span className="text-gray-400 text-xs">👤</span>;
            })()}
          </div>
          {/* Name + Role */}
          <div>
            <h1 className="text-[16px]">{displayData.account.fullName}</h1>
            <p className="text-[14px] text-app-neutral-gray3">
              {post ? (post.type === 'buy' ? 'Cần mua' : 'Cung cấp') : displayData.account.accountRole}
            </p>
          </div>
        </div>
        <div>
          <AccountTypeBadge accountType={displayData.account.accountType} />
        </div>
      </div>
      {/* Content  */}
      <div className={cn("flex flex-col gap-3")}>
        <h2 className="font-semibold text-[16px] md:text-[20px]">
          {displayData.project.name}
        </h2>
        <div className="flex gap-3 flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-2">
            {displayData.project.field.map((field, index) => {
              return (
                <span
                  className="px-2 py-1 bg-blue-100 text-blue-500 text-[14px] rounded"
                  key={index}
                >
                  {field}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center gap-[5px]">
              <Image
                src={"/images/icons/calendar.svg"}
                alt="calendar"
                width={24}
                height={24}
              />
              <span className="text-[14px]">{displayData.project.createdDate}</span>
            </div>
            <div className="flex items-center justify-center gap-[5px]">
              <Image
                src={"/images/icons/mappin.svg"}
                alt="calendar"
                width={24}
                height={24}
              />
              <span className="text-[14px]">{displayData.project.address}</span>
            </div>
          </div>
        </div>
        <p className={cn("line-clamp-2 text-ellipsis text-app-neutral-gray3")}>
          {displayData.project.description}
        </p>
      </div>
      {/* Footer  */}
      <div
        className={cn(
          "pt-3 border-t",
          "flex flex-col md:flex-row items-center gap-3"
        )}
      >
        <div className="flex-1 flex flex-wrap md:flex-nowrap items-start gap-2">
          <div className="space-y-2">
            <p className="text-[14px] text-app-blue">Vốn huy động</p>
            <p className="text-primary-bold font-medium text-2xl">
              {displayData.project.mobilizedCapital}{" "}
              {displayData.project.mobilizedCapitalUnit}
            </p>
          </div>
        </div>
        <Button className="bg-app-blue hover:bg-app-blue/90 cursor-pointer w-full md:w-fit">
          Xem chi tiết
        </Button>
      </div>
    </div>
  );
}
