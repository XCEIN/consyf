import { Metadata } from "next";
import ProfilePageClient from "./profile";

export const metadata: Metadata = {
  title: "Trang cá nhân",
};
export default function ProfilePage() {
  return <ProfilePageClient />;
}
