"use client";

import Button from "@/components/commons/button";
import Checkbox from "@/components/commons/checkbox";
import Input from "@/components/commons/input";
import Label from "@/components/commons/label";
import { cn } from "@/lib/utils";
import { loginSchema, LoginType } from "@/schema/auth.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function SignInPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: yupResolver(loginSchema),
  });
  
  const submit = async (lgType: LoginType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lgType),
      });
      const result = await response.json();
      
      if (!response.ok) {
        if (result.requireVerification) {
          sessionStorage.setItem('verifyEmail', result.email);
          router.push('/sign-up/verify');
          return;
        }
        setError(result.error || 'Đăng nhập thất bại');
        return;
      }
      
      // Save token and user info
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error("Login error:", err);
      setError('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("bg-transparent max-w-[360px] flex flex-col gap-6")}>
      <div className="flex flex-col justify-center items-center gap-4">
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
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold ">Đăng nhập</h1>
          <p className="text-app-neutral-gray2 text-base">
            Welcome back! Please enter your details
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(submit)}
        className={cn("flex flex-col gap-5")}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Tên tài khoản</Label>
          <Input
            {...register("username")}
            error={errors.username?.message}
            className="w-96"
            placeholder="Nhập tài khoản"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Mật khẩu</Label>
          <Input
            {...register("password")}
            error={errors.password?.message}
            className="w-96"
            placeholder=""
            type="password"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <Checkbox id="terms" className="cursor-pointer" />
            <Label htmlFor="terms" className="text-sm">
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
        
        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#0D92F4] hover:bg-[#0D92F4] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </div>
      </form>
      <div className="flex flex-col justify-center items-center">
        <p className="flex items-center justify-center gap-1 text-sm">
          Bạn chưa có tài khoản?{" "}
          <Link className="text-primary-bold font-medium" href={"/sign-up"}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
