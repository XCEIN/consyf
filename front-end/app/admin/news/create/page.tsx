import { Metadata } from "next";
import NewsEditor from "../news-editor";

export const metadata: Metadata = {
  title: "Tạo bài viết mới - Admin",
  description: "Tạo bài viết tin tức mới",
};

export default function CreateNewsPage() {
  return <NewsEditor mode="create" />;
}
