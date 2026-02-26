import { Metadata } from "next";
import ResetPasswordClient from "./reset-password";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
