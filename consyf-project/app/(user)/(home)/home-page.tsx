"use client";

import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";
import SocialProofSection from "./social-proof-section";
import BentoSection from "./bento-section";
import HeroSection from "./hero-section";

const ProjectSection = dynamic(() => import("./project-section"), {
  ssr: false,
});
const PostSection = dynamic(() => import("./post-section"), {
  ssr: false,
});

export default function HomePageClient() {
  return (
    <section className={cn("hidden-scroll-x")}>
      <HeroSection />
      <BentoSection />
      <ProjectSection />
      <PostSection />
      <SocialProofSection />
    </section>
  );
}
