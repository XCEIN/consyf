import { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
