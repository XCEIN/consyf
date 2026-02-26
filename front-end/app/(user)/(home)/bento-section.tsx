"use client";

import { cn } from "@/lib/utils";
import Carousel from "@/components/commons/carousel";
import { useEffect, useState } from "react";
import { CarouselApi } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useWindowSize from "@/contexts/window-size.context";

interface BentoItem {
  image: string;
  style: string;
  title: string;
}

const bentoItems: BentoItem[][] = [
  [
    {
      image: "/images/user/home/bento/frame1.svg",
      style: "basis-3/5",
      title: "Đầu Tư Tương Lai",
    },
    {
      image: "/images/user/home/bento/frame2.svg",
      style: "basis-2/5",
      title: "Công Nghệ & Sáng Tạo",
    },
  ],
  [
    {
      image: "/images/user/home/bento/frame3.svg",
      style: "basis-2/5",
      title: "Đúng Người - Đúng Việc",
    },
    {
      image: "/images/user/home/bento/frame4.svg",
      style: "basis-3/5",
      title: "Đối Tác Chiến Lược",
    },
  ],
];
const bentoItemsMobile: BentoItem[] = bentoItems.reduce(
  (prev, curr) => [...prev, ...curr.map((b) => b)],
  [] as BentoItem[]
);
export default function BentoSection() {
  const { width } = useWindowSize();
  return width >= 1024 ? (
    <div
      className={cn(
        "container mx-auto",
        "hidden lg:flex flex-col gap-4",
        "py-12"
      )}
    >
      {bentoItems.map((items, index) => {
        return (
          <div className="flex gap-4" key={index}>
            {items.map((bento) => {
              return (
                <div
                  key={bento.image}
                  style={{
                    backgroundImage: `url('${bento.image}')`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className={cn(
                    bento.style,
                    "bg-red-200 h-96 rounded-4xl flex flex-col justify-center items-center text-white"
                  )}
                >
                  <p className="font-semibold text-[40px]">{bento.title}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  ) : (
    <div className="lg:hidden container mx-auto">
      <BentoSectionMobile />
    </div>
  );
}

function BentoSectionMobile() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div className="flex flex-col justify-center items-center gap-8">
      <Carousel setApi={setApi} className="w-full max-w-full overflow-hidden">
        <Carousel.Content>
          {bentoItemsMobile.map((bento, index) => (
            <Carousel.Item key={index}>
              <div
                className="p-1 h-[358px] bg-cover bg-center rounded-4xl flex flex-col justify-center items-center"
                style={{ backgroundImage: `url(${bento.image})` }}
              >
                <p className="font-semibold text-[24px] text-white">
                  {bento.title}
                </p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>
      {/* 🔹 Nút chỉ slide (dots) */}
      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === index + 1
                ? "bg-primary-bold scale-110"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
      <CustomArrows
        onNext={() => api?.scrollNext()}
        onPrev={() => api?.scrollPrev()}
      />
    </div>
  );
}

function CustomArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="w-full flex justify-between items-center pointer-events-none">
      <button
        onClick={onPrev}
        className="flex items-center justify-center w-10 h-10 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-all pointer-events-auto cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={onNext}
        className="flex items-center justify-center w-10 h-10 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-all pointer-events-auto cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
