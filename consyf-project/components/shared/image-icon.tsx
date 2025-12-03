"use client";

import Image from "next/image";
import { ComponentProps } from "react";
//Icons có đường dẫn /images/icons/* cho nên chỉ cần thêm tên hoặc đường dẫn tiếp theo
interface ImageIconProps extends ComponentProps<"image"> {
  alt?: string;
  src: string;
  size?: number;
  widthHeight?: {
    width: number;
    height: number;
  };
}
export default function ImageIcon({
  alt,
  src,
  size,
  widthHeight,
  className,
}: ImageIconProps) {
  const srcFull =
    `/images/icons/` + (src.startsWith("/") ? src.substring(1) : src);
  return (
    <Image
      alt={alt || src}
      src={srcFull}
      priority
      width={size || widthHeight?.width}
      height={size || widthHeight?.height}
      className={className}
    />
  );
}
