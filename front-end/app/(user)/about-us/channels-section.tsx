"use client";

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Channel {
    id: string;
    title: string;
    subtitle: string;
    thumbnail: string;
    link: string;
}

const channels: Channel[] = [
    {
        id: '1',
        title: '[CONSYF] - Đối tác của bạn là ai? 05 - Nguyễn Thế Hùng: Bán lĩnh người dũng d...',
        subtitle: 'ConSYF Talks',
        thumbnail: '/images/user/about-us/channels/channel_image1.svg',
        link: '#',
    },
    {
        id: '2',
        title: '[CONSYF] - Đối tác của bạn là ai? 05 - Nguyễn Thế Hùng: Bán lĩnh người dũng d...',
        subtitle: 'Consyf - Connect, Set Your future',
        thumbnail: '/images/user/about-us/channels/channel_image2.svg',
        link: '#',
    },
    {
        id: '3',
        title: '[CONSYF] - Đối tác của bạn là ai? 05 - Nguyễn Thế Hùng: Bán lĩnh người dũng d...',
        subtitle: 'Consyf - Connect, Set Your future',
        thumbnail: '/images/user/about-us/channels/channel_image2.svg',
        link: '#',
    },
];

export default function ChannelsSection() {
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
                        Giới thiệu các kênh của chúng tôi
                    </h2>
                    <p className={cn(
                        "text-lg md:text-xl",
                        "text-gray-600",
                        "font-normal",
                        "max-w-3xl mx-auto"
                    )}>
                        Kết nối với chúng tôi qua các kênh truyền thông chính thức dưới đây.
                    </p>
                </div>

                {/* Channel Cards */}
                <div className={cn(
                    "grid",
                    "sm:grid-cols-2 lg:grid-cols-3",
                    "gap-6 lg:gap-8"
                )}>
                    {channels.map((channel) => (
                        <Link
                            key={channel.id}
                            href={channel.link}
                            className={cn(
                                "group",
                                "flex flex-col",
                                "overflow-hidden"
                            )}
                        >
                            {/* Thumbnail */}
                            <div className={cn(
                                "relative",
                                "w-full",
                                "aspect-video",
                                "overflow-hidden"
                            )}>
                                <Image
                                    src={channel.thumbnail}
                                    alt={channel.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className={cn(
                                        "object-cover",
                                        "group-hover:scale-105",
                                        "transition-transform duration-300"
                                    )}
                                />
                            </div>

                            {/* Content */}
                            <div className={cn(
                                "py-4",
                                "flex gap-3"
                            )}>
                                {/* Logo */}
                                <div className="shrink-0">
                                    <div className={cn(
                                        "w-10 h-10",
                                        "bg-white rounded-full",
                                        "flex items-center justify-center",
                                        "overflow-hidden"
                                    )}>
                                        <Image
                                            alt="CONSYF Logo"
                                            src="/images/icons/logo_trans_1.svg"
                                            width={36}
                                            height={36}
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className={cn(
                                    "flex-1",
                                    "min-w-0"
                                )}>
                                    {/* Title */}
                                    <h3 className={cn(
                                        "text-sm md:text-base",
                                        "font-semibold",
                                        "text-gray-900",
                                        "mb-1",
                                        "line-clamp-2",
                                        "group-hover:text-blue-600",
                                        "transition-colors",
                                        "leading-snug"
                                    )}>
                                        {channel.title}
                                    </h3>

                                    {/* Subtitle */}
                                    <p className={cn(
                                        "text-xs md:text-base",
                                        "font-normal",
                                        "text-gray-500",
                                        "truncate"
                                    )}>
                                        {channel.subtitle}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
