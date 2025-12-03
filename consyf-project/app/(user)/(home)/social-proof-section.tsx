"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface SocialProofItem {
  title: string;
  icon: string;
}
const socialProofItems: SocialProofItem[] = [
  { title: "Boltshift", icon: "/images/user/home/social-proof/boltshift.svg" },
  { title: "Lightbox", icon: "/images/user/home/social-proof/lightbox.svg" },
  {
    title: "FeatherDev",
    icon: "/images/user/home/social-proof/featherdev.svg",
  },
  { title: "Spherule", icon: "/images/user/home/social-proof/spherule.svg" },
  {
    title: "GlobalBank",
    icon: "/images/user/home/social-proof/globalbank.svg",
  },
  { title: "Nietzsche", icon: "/images/user/home/social-proof/nietzsche.svg" },
];
export default function SocialProofSection() {
  return (
    <div className={cn("container mx-auto", "py-12")}>
      <div className={cn("py-24 shadow-xs border rounded-2xl space-y-4")}>
        <p className="text-sm font-medium text-app-neutral-gray2 text-center">
          Join 4,000+ companies already growing
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {socialProofItems.map((sp) => {
            return (
              <li
                key={sp.icon}
                className="flex items-center font-bold gap-2 justify-center"
              >
                <Image alt={sp.title} src={sp.icon} width={44} height={44} />
                <span className="text-2xl">{sp.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
