import { Metadata } from "next";
import NewsManagementSection from "./news-management-section";

export const metadata: Metadata = {
  title: "Quản lý tin tức - Admin",
  description: "Quản lý bài viết tin tức",
};

export default function NewsManagementPage() {
  return <NewsManagementSection />;
}
