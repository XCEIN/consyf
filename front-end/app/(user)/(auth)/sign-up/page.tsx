import { Metadata } from "next";
import SignUpPageClient from "./sign-up";

export const metadata: Metadata = {
  title: "Đăng ký",
};
export default function SignInPage() {
  return <SignUpPageClient />;
}
