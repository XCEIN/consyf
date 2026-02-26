import { Metadata } from "next";
import VerifyPageClient from "./verify";
export const metadata: Metadata = {
  title: "Xác thực OTP",
};
export default function VerifyPage() {
  return <VerifyPageClient />;
}
