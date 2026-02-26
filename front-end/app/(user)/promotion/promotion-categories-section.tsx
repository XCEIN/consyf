"use client";

import { cn } from "@/lib/utils";
import PromotionCard from "@/components/shared/user/promotion-card";
import { Promotion } from "@/components/shared/user/promotion-card";
import Breadcrumb from "@/components/shared/breadcrumb";

const health: Promotion[] = [
  {
    id: "h1",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "h2",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "h3",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "h4",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
];

const transport: Promotion[] = [
  {
    id: "t1",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "t2",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "t3",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
  {
    id: "t4",
    title: "Giảm 12% cho tất cả dịch vụ",
    description: "Ưu đãi đặc biệt từ nhà đầu tư dành cho bạn",
    expiryDate: "20/12/2025",
  },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={cn("mb-6")}>
      <h2 className={cn("text-3xl font-semibold text-[#123B8A]")}>{title}</h2>
    </div>
  );
}

export default function PromotionCategoriesSection() {
  return (
    <section className={cn("py-6 md:py-8 bg-app-backgroud")}>
      <div className={cn("max-w-7xl mx-auto px-4 md:px-6 lg:px-8")}>
        {/* Breadcrumb*/}
        <div className={cn("hidden md:block text-sm text-gray-500 mb-16")}>
          <Breadcrumb
            labelCurrent="Danh sách khuyến mãi"
            labelPrevious={[{ label: "Trang chủ", href: "/" }]}
          />
        </div>

        {/* Health */}
        <div className={cn("mb-10")}>
          <div className={cn("flex items-center justify-between mb-3")}>
            <SectionHeader title="Lĩnh vực Y tế" />
          </div>

          <div
            className={cn(
              "mt-4 grid grid-cols-1 sm:grid-cols-2",
              "lg:grid-cols-2 xl:grid-cols-2 gap-5"
            )}
          >
            {health.slice(0, 4).map((p) => (
              <PromotionCard key={p.id} promotion={p} />
            ))}
          </div>
        </div>

        {/* Transport */}
        <div>
          <div className={cn("flex items-center justify-between mb-3")}>
            <SectionHeader title="Lĩnh vực Giao thông" />
          </div>

          <div
            className={cn(
              "mt-4 grid grid-cols-1 sm:grid-cols-2",
              "lg:grid-cols-2 xl:grid-cols-2 gap-5"
            )}
          >
            {transport.slice(0, 4).map((p) => (
              <PromotionCard key={p.id} promotion={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
