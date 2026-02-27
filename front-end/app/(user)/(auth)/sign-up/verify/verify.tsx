"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/commons/button";
import Link from "next/link";
import Input from "@/components/commons/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_URL } from "@/constants/api.const";

export default function VerifyPageClient() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get email from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verifyEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push('/sign-up');
    }
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // chỉ nhận số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Mã OTP không hợp lệ');
        return;
      }
      
      // Save token and user info
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      setSuccess('Xác thực thành công! Đang chuyển hướng...');
      sessionStorage.removeItem('verifyEmail');
      setTimeout(() => window.location.href = "/", 1500);
    } catch (err) {
      console.error("Verify error:", err);
      setError('Đã xảy ra lỗi khi xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Không tìm thấy email');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Không thể gửi lại mã');
        return;
      }
      
      setSuccess('Mã OTP mới đã được gửi đến email của bạn');
      setTimeLeft(300); // Reset timer
    } catch (err) {
      console.error("Resend error:", err);
      setError('Đã xảy ra lỗi khi gửi lại mã');
    } finally {
      setIsLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col max-w-[360px] gap-8">
      <div className="flex flex-col items-center gap-6">
        <div className="w-14 h-14">
          <Image
            src="/images/icons/email.svg"
            alt="email icon"
            width={56}
            height={65}
          />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-center">Kiểm tra email</h1>
          <p className="text-center text-app-neutral-gray3">
            Chúng tôi đã gửi mã qua email <br />
            <span className="font-medium text-app-neutral-gray1">
              {email || 'Đang tải...'}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* OTP Inputs */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                maxLength={1}
                className={cn(
                  "w-20 h-20 text-center text-3xl lg:text-5xl font-bold "
                )}
                groupClassName={cn("h-20", {
                  "border-app-blue": digit.trim().length === 1,
                })}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Mã còn hiệu lực:{" "}
            <span className="text-blue-500">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </span>
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded w-full">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded w-full">
            {success}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={otp.some((d) => d === "") || isLoading}
          className={cn(
            "w-full max-w-[360px] py-2.5",
            otp.some((d) => d === "") || isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary-bold hover:bg-primary-bold/90 cursor-pointer"
          )}
        >
          {isLoading ? "Đang xác minh..." : "Xác minh email"}
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Không nhận được mã?{" "}
        <button 
          onClick={handleResend}
          disabled={isLoading}
          className="text-blue-500 underline cursor-pointer disabled:opacity-50"
        >
          Nhấn để gửi lại
        </button>
      </p>

      <Link
        href="/sign-in"
        className="mt-4 text-sm text-gray-500 flex flex-col items-center gap-1 cursor-pointer"
      >
        ← Quay lại trang đăng nhập
      </Link>
    </div>
  );
}
