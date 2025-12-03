import { Metadata } from "next";
import SignInPageClient from "./sign-in";

export const metadata: Metadata = {
  title: "Đăng nhập",
};
export default function SignInPage() {
  return <SignInPageClient />;
}
