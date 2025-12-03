"use client";

import { cn } from "@/lib/utils";
import ImageIcon from "../image-icon";

export type Promotion = {
    id: string;
    title: string;
    description: string;
    expiryDate: string; // dd/MM/yyyy
};

type Props = {
    promotion: Promotion;
};

export default function PromotionCard({ promotion }: Props) {
    return (
        <div className={cn("relative flex")}>
            {/* card */}
            <div
                className={cn(
                    "relative bg-white rounded-l-2xl shadow-md",
                    "hover:shadow-lg transition-shadow duration-300",
                    "flex-1"
                )}
            >
                {/* top row */}
                <div className={cn("flex items-start justify-between px-4 pt-3")}>
                    <span
                        className={cn(
                            "inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-blue-100 text-blue-700 text-base font-medium"
                        )}
                    >
                        x4
                    </span>

                    <button
                        type="button"
                        className={cn(
                            "text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        )}
                    >
                        Xem chi tiết
                    </button>
                </div>

                {/* content */}
                <div className={cn("px-4 py-3")}>
                    <div className={cn("flex gap-2 mb-6")}>
                        <ImageIcon src="discount.svg" alt="discount" size={40} />
                        <h3
                            className={cn(
                                "text-xl font-extrabold text-gray-900 leading-snug"
                            )}
                        >
                            {promotion.title}
                        </h3>
                    </div>

                    <p className={cn("mt-2 text-base text-app-neutral-gray2")}>
                        {promotion.description}
                    </p>

                    <p className={cn("mt-2 text-xs text-blue-400 font-medium")}>
                        Hết hạn: {promotion.expiryDate}
                    </p>

                    <button
                        type="button"
                        className={cn(
                            "mt-4 w-full h-9 rounded-lg",
                            "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
                            "text-white text-sm font-semibold transition-colors",
                            "cursor-pointer"
                        )}
                    >
                        Nhận ưu đãi
                    </button>
                </div>
            </div>
            {/* Discount Strip */}
            <div
                className={cn(
                    "relative w-16 bg-[#69B3F5] shadow-md flex items-center justify-center rounded-r-2xl"
                )}
                style={{
                    maskImage: `radial-gradient(ellipse 10px 16px at 100% 50%, transparent 100%, black 105%)`,
                    WebkitMaskImage: `radial-gradient(ellipse 10px 16px at 100% 50%, transparent 100%, black 105%)`,
                }}
            >
                <span
                    className={cn("text-white text-xl font-medium tracking-wider")}
                    style={{ writingMode: "vertical-rl" }}
                >
                    DISCOUNT
                </span>
            </div>
        </div>
    );
}
