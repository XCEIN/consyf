"use client";

import Button from "@/components/commons/button";
import Checkbox from "@/components/commons/checkbox";
import Input from "@/components/commons/input";
import Label from "@/components/commons/label";
import ImageIcon from "@/components/shared/image-icon";
import { cn } from "@/lib/utils";
import { registerSchema, RegisterType } from "@/schema/auth.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { API_URL } from "@/constants/api.const";

const CheckIcon: FC<{ checked: boolean }> = ({ checked }) => {
  return (
    <ImageIcon
      alt="checkicon"
      src={checked ? "checked.svg" : "uncheck.svg"}
      size={20}
    />
  );
};

export default function SignUpPageClient() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: yupResolver(registerSchema),
  });

  const passwordValue = watch("password") || "";

  // Kiểm tra các điều kiện
  const isLengthValid = passwordValue.length >= 8;
  const isSpecialOrUppercase = /[A-Z!@#$%^&*]/.test(passwordValue);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: RegisterType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Đã xảy ra lỗi khi đăng ký');
        return;
      }
      
      // Store email for verification page
      sessionStorage.setItem('verifyEmail', data.email);
      router.push("/sign-up/verify");
    } catch (err) {
      console.error("Register error:", err);
      setError('Đã xảy ra lỗi khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("bg-transparent max-w-[360px] flex flex-col gap-6")}>
      <div className="flex flex-col justify-center items-center gap-4">
        <Link href="/" className="w-12 h-12">
          <Image
            alt="logo"
            src="/images/icons/logo_trans_1.svg"
            width={48}
            height={48}
            priority
          />
        </Link>
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Đăng ký tài khoản</h1>
          <p className="text-app-neutral-gray2 text-base">
            Start your 30-day free trial.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Tên tài khoản</Label>
          <Input
            {...register("name")}
            error={errors.name?.message}
            placeholder="Enter your name"
            className="w-96"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Email</Label>
          <Input
            {...register("email")}
            error={errors.email?.message}
            placeholder="Enter your email"
            className="w-96"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Số điện thoại</Label>
          <Input
            {...register("phone")}
            error={errors.phone?.message}
            placeholder="Enter your phone number"
            className="w-96"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Mật khẩu</Label>
          <Input
            {...register("password")}
            placeholder="********"
            type="password"
            className="w-96"
          />
        </div>

        {/* Password rules */}
        <div className="text-sm flex flex-col gap-2 pl-1">
          <div
            className={cn("flex items-center gap-2", "text-app-neutral-gray2")}
          >
            <CheckIcon checked={isLengthValid} />
            Mật khẩu phải có ít nhất 8 ký tự
          </div>
          <div
            className={cn("flex items-center gap-2", "text-app-neutral-gray2")}
          >
            <CheckIcon checked={isSpecialOrUppercase} />
            Phải có ký tự đặc biệt hoặc viết hoa
          </div>
        </div>

        {/* Remember password */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <Checkbox id="remember" className="cursor-pointer" />
            <Label htmlFor="remember" className="text-sm">
              Nhớ mật khẩu
            </Label>
          </div>
          <Link
            className="text-primary-bold font-medium text-sm"
            href={"/forgot-password"}
          >
            Quên mật khẩu?
          </Link>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#0D92F4] hover:bg-[#0D92F4] cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </form>

      <div className="flex flex-col justify-center items-center">
        <p className="flex items-center justify-center gap-1 text-sm">
          Bạn đã có tài khoản?{" "}
          <Link className="text-primary-bold font-medium" href={"/sign-in"}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
