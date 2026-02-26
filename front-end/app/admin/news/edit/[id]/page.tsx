import { Metadata } from "next";
import NewsEditor from "../../news-editor";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết - Admin",
  description: "Chỉnh sửa bài viết tin tức",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  return <NewsEditor mode="edit" newsId={id} />;
}
