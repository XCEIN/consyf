"use client";

import Image from 'next/image';
import { Phone, Mail, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

const contactMethods = [
    {
        icon: Phone,
        title: 'Điện thoại - Zalo',
        description: 'Từ sáng tới tối, từ 8h - 17h (T2 - T6)',
        value: '039 621 6888',
        link: 'tel:0396216888',
        color: 'bg-blue-500',
    },
    {
        icon: Mail,
        title: 'Email',
        description: 'Gửi yêu cầu hoặc học thắc mắc đến chúng tôi',
        value: 'consyf.info@gmail.com',
        link: 'mailto:consyf.info@gmail.com',
        color: 'bg-blue-500',
    },
    {
        icon: Facebook,
        title: 'Facebook',
        description: 'Kết nối và nhắn tin trực tiếp qua fanpage chính thức',
        value: 'Consyf - Connect, Set Your future',
        link: '#',
        color: 'bg-blue-500',
    },
];

export default function ContactsSection() {
    return (
        <section className={cn(
            "py-16 px-4",
            "max-w-7xl mx-auto"
        )}>
            {/* Header */}
            <div className={cn(
                "text-center",
                "mb-12",
                "p-8",
                "bg-white"
            )}>
                <h1 className={cn(
                    "text-3xl md:text-4xl",
                    "font-bold",
                    "mb-4",
                    "text-gray-900"
                )}>
                    Liên hệ trực tiếp với chúng tôi
                </h1>
                <p className={cn(
                    "text-gray-600",
                    "font-normal",
                    "text-xl",
                    "mb-16"
                )}>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn qua các kênh liên hệ dưới đây.
                </p>
            </div>

            {/* Meeting Room Image */}
            <div className={cn(
                "mb-24",
                "overflow-hidden"
            )}>
                <div className={cn(
                    "relative",
                    "w-full",
                    "h-[480px]"
                )}>
                    <Image
                        src="/images/user/about-us/contacts/contact_background.svg"
                        alt="Meeting Room"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Contact Cards */}
            <div className={cn(
                "grid md:grid-cols-3",
                "gap-6",
                "bg-white"
            )}>
                {contactMethods.map((method, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex flex-col",
                            "p-6",
                            "bg-app-neutral-gray7",
                            "rounded-lg",
                            "hover:shadow-lg",
                            "transition-shadow duration-300"
                        )}
                    >
                        {/* Icon */}
                        <div className={cn(
                            "w-12 h-12",
                            method.color,
                            "rounded-lg",
                            "flex items-center justify-center",
                            "mb-16"
                        )}>
                            <method.icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className={cn(
                            "text-xl",
                            "font-bold",
                            "mb-2",
                            "text-gray-900"
                        )}>
                            {method.title}
                        </h3>

                        {/* Description */}
                        <p className={cn(
                            "text-gray-600",
                            "text-base",
                            "mb-4"
                        )}>
                            {method.description}
                        </p>

                        {/* Contact Value/Link */}
                        <a
                            href={method.link}
                            className={cn(
                                "text-blue-600",
                                "hover:text-blue-700",
                                "font-semibold",
                                "wrap-break-word",
                                "transition-colors duration-200"
                            )}
                            target={method.link.startsWith('http') ? '_blank' : undefined}
                            rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {method.value}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
