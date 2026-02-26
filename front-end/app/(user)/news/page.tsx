import { Metadata } from "next";
import NewsListPage from "./news-list";

export const metadata: Metadata = {
  title: "Tin tức - Consyf",
  description: "Tin tức mới nhất về thị trường đầu tư và kinh doanh",
};

export default function NewsPage() {
  return <NewsListPage />;
}
