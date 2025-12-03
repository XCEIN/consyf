"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Partner {
    id: string;
    name: string;
    logo: string;
    description: string;
}

const partners: Partner[] = [
    {
        id: '1',
        name: 'Razer',
        logo: '/images/user/about-us/partners/razer.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '2',
        name: 'Beats',
        logo: '/images/user/about-us/partners/beats.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '3',
        name: 'Pepsi',
        logo: '/images/user/about-us/partners/pepsi.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '4',
        name: 'Starbucks',
        logo: '/images/user/about-us/partners/starbucks.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '5',
        name: 'Dole',
        logo: '/images/user/about-us/partners/dole.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '6',
        name: 'Huawei',
        logo: '/images/user/about-us/partners/huawei.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '7',
        name: 'The North Face',
        logo: '/images/user/about-us/partners/northface.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '8',
        name: 'SeptWolves',
        logo: '/images/user/about-us/partners/septwolves.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
    {
        id: '9',
        name: 'McDonald\'s',
        logo: '/images/user/about-us/partners/mcdonalds.svg',
        description: 'Dòng hành trong lĩnh vực thanh toán & giải pháp số.',
    },
];

export default function PartnersSection() {
    return (
        <section className={cn(
            "py-16 md:py-20",
            "bg-app-backgroud",
            "w-full"
        )}>
            <div className={cn(
                "px-4 md:px-6 lg:px-8",
                "max-w-7xl mx-auto"
            )}>
                {/* Header */}
                <div className={cn(
                    "text-center",
                    "mb-12 md:mb-16"
                )}>
                    <h2 className={cn(
                        "text-3xl md:text-4xl",
                        "font-bold",
                        "mb-4",
                        "text-gray-900"
                    )}>
                        Giới thiệu các đối tác chúng tôi
                    </h2>
                    <p className={cn(
                        "text-lg md:text-xl",
                        "font-normal",
                        "text-gray-600",
                        "max-w-3xl mx-auto"
                    )}>
                        Kết nối với chúng tôi qua các kênh truyền thông chính thức dưới đây.
                    </p>
                </div>

                {/* Partners Grid */}
                <div className={cn(
                    "grid",
                    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
                    "gap-6 md:gap-8"
                )}>
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className={cn(
                                "group",
                                "bg-white",
                                "rounded-md",
                                "p-8",
                                "flex flex-col items-start",
                                "hover:shadow-lg",
                                "transition-all duration-300"
                            )}
                        >
                            {/* Logo Container */}
                            <div className={cn(
                                "w-20 h-20",
                                "mb-6",
                                "flex items-center justify-center"
                            )}>
                                <div className={cn(
                                    "relative",
                                    "w-full h-full"
                                )}>
                                    <Image
                                        src={partner.logo}
                                        alt={`${partner.name} logo`}
                                        fill
                                        className="object-contain"
                                        sizes="80px"
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <h3 className={cn(
                                "text-xl",
                                "font-bold",
                                "text-gray-900",
                                "mb-2"
                            )}>
                                Công ty ABC
                            </h3>

                            {/* Description */}
                            <p className={cn(
                                "text-base",
                                "text-gray-600",
                                "font-normal",
                                "leading-relaxed"
                            )}>
                                {partner.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
