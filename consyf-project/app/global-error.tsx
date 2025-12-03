"use client";

import Image from "next/image";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-gray-50 to-gray-200 text-center text-gray-800 px-6 relative overflow-hidden">
        {/* Hiệu ứng nền */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-300 opacity-30 blur-3xl rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-300 opacity-30 blur-3xl rounded-full"></div>
        </div>

        {/* Logo */}
        <div className="mb-6">
          <Link href={"/"}>
            <Image
              src="/images/icons/logo_trans_1.svg"
              alt="Website Logo"
              width={80}
              height={80}
            />
          </Link>
        </div>

        {/* Tiêu đề lỗi */}
        <h1 className="text-4xl font-bold mb-2">Đã có lỗi xảy ra 😢</h1>
        <p className="text-gray-600 mb-6">
          Xin lỗi, hệ thống gặp sự cố. Bạn có thể thử lại sau.
        </p>

        {/* Hiển thị digest để debug (tùy chọn) */}
        {error?.digest && (
          <p className="text-sm text-gray-400 mb-4">Mã lỗi: {error.digest}</p>
        )}

        {/* Nút thử lại */}
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          Thử lại
        </button>

        {/* Footer nhỏ */}
        <p className="mt-10 text-xs text-gray-400">© 2025</p>
      </body>
    </html>
  );
}
