"use client";

import Button from "@/components/commons/button";
import { Clock, Bell } from "lucide-react";

export default function PriceListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bảng giá dịch vụ
          </h1>
          <p className="text-lg text-gray-600">
            Chọn gói phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-2xl border-2 border-blue-200 p-8 bg-white shadow-lg">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Đang cập nhật
              </h2>
              <p className="text-gray-600 mb-6">
                Bảng giá dịch vụ đang được xây dựng và sẽ được cập nhật trong thời gian tới. 
                Vui lòng quay lại sau hoặc đăng ký nhận thông báo khi có cập nhật mới.
              </p>

              {/* Decorative elements */}
              <div className="flex justify-center gap-2 mb-8">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>

              {/* CTA Button */}
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-medium inline-flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Nhận thông báo khi có bảng giá
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Nếu bạn cần tư vấn ngay, vui lòng liên hệ với chúng tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:contact@consyf.vn" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              contact@consyf.vn
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a 
              href="tel:0123456789" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              0123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
