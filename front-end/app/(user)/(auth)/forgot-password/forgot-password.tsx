"use client";

import Button from "@/components/commons/button";
import Input from "@/components/commons/input";
import Label from "@/components/commons/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Đã xảy ra lỗi');
        return;
      }
      
      setSuccess(result.message || 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi');
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError('Đã xảy ra lỗi khi gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("bg-transparent max-w-[488px] flex flex-col gap-8")}>
      {/* Header with Logo */}
      <div className="flex flex-col justify-center items-center gap-6">
        <div>
          <Link href={"/"} className={cn("w-12 h-12")}>
            <Image
              alt="logo"
              src={"/images/icons/logo_trans_1.svg"}
              width={48}
              height={48}
              priority
            />
          </Link>
        </div>
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-app-neutral-gray2 text-base">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6")}>
        <div
          className={cn(
            "bg-white rounded-xl border border-gray-200 shadow-sm",
            "p-6 flex flex-col gap-5"
          )}
        >
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
              error={error}
              wrapClassName="w-full max-w-full"
              groupClassName="w-full"
              className="w-full"
              placeholder="Enter your email"
            />
          </div>

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
              {success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#0D92F4] hover:bg-[#0D92F4]/90 cursor-pointer font-medium disabled:opacity-50"
            >
              {isLoading ? "Đang gửi..." : "Send Reset Link"}
            </Button>
          </div>
        </div>
      </form>

      {/* Back to login link */}
      <div className="flex flex-col justify-center items-center">
        <p className="flex items-center justify-center gap-1 text-sm text-app-neutral-gray2">
          Remember your password?{" "}
          <Link
            className="text-[#0D92F4] font-medium hover:underline"
            href={"/sign-in"}
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
