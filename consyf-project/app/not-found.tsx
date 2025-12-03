"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-800 px-6 relative overflow-hidden">
      {/* Hiệu ứng nền */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-300 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-300 opacity-30 blur-3xl rounded-full"></div>
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <Image
            src="/images/icons/logo_trans_1.svg"
            alt="Website Logo"
            width={100}
            height={100}
            className="hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Tiêu đề */}
      <h1 className="text-6xl font-extrabold text-gray-800 mb-2 tracking-tight drop-shadow-sm">
        404
      </h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-3">
        Trang không tồn tại 🚫
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        Xin lỗi, chúng tôi không thể tìm thấy trang bạn yêu cầu. Hãy kiểm tra
        lại địa chỉ hoặc quay về trang chủ nhé!
      </p>

      {/* Nút quay lại */}
      <Link
        href="/"
        className="inline-block px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.03]"
      >
        ← Quay về trang chủ
      </Link>

      {/* Footer nhỏ */}
      <p className="mt-10 text-xs text-gray-400">© 2025</p>
    </div>
  );
}
