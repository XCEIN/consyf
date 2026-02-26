import { Metadata } from "next";
import HomePageClient from "./home-page";

export const metadata: Metadata = {
  title: "Trang chủ",
};
export default function HomePage() {
  return <HomePageClient />;
}
