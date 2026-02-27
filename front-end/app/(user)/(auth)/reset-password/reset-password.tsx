"use client";

import Button from "@/components/commons/button";
import Input from "@/components/commons/input";
import Label from "@/components/commons/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { API_URL } from "@/constants/api.const";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Link đặt lại mật khẩu không hợp lệ");
    }
  }, [token]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/(?=.*[A-Z])|(?=.*[!@#$%^&*])/.test(pwd)) {
      return "Mật khẩu phải có ký tự đặc biệt hoặc chữ hoa";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Đã xảy ra lỗi");
        return;
      }

      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Đã xảy ra lỗi khi đặt lại mật khẩu");
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
          <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
          <p className="text-app-neutral-gray2 text-base">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>
      </div>

      {/* Form */}
      {tokenValid ? (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6")}>
          <div
            className={cn(
              "bg-white rounded-xl border border-gray-200 shadow-sm",
              "p-6 flex flex-col gap-5"
            )}
          >
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Mật khẩu mới
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                wrapClassName="w-full max-w-full"
                groupClassName="w-full"
                className="w-full"
                placeholder="Nhập mật khẩu mới"
              />
              <p className="text-xs text-gray-500">
                Ít nhất 8 ký tự, có chữ hoa hoặc ký tự đặc biệt
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                wrapClassName="w-full max-w-full"
                groupClassName="w-full"
                className="w-full"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

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
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div
          className={cn(
            "bg-white rounded-xl border border-gray-200 shadow-sm",
            "p-6 flex flex-col gap-5"
          )}
        >
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded text-center">
            {error || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"}
          </div>
          <Link href="/forgot-password">
            <Button className="w-full py-2.5 bg-[#0D92F4] hover:bg-[#0D92F4]/90 cursor-pointer font-medium">
              Gửi lại link đặt lại mật khẩu
            </Button>
          </Link>
        </div>
      )}

      {/* Back to login link */}
      <div className="flex flex-col justify-center items-center">
        <p className="flex items-center justify-center gap-1 text-sm text-app-neutral-gray2">
          Nhớ mật khẩu?{" "}
          <Link
            className="text-[#0D92F4] font-medium hover:underline"
            href={"/sign-in"}
          >
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D92F4]"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
