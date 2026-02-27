import { Metadata } from "next";
import NewsDetailPage from "./news-detail";
import { API_URL } from "@/constants/api.const";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const backendUrl = API_URL;
  
  try {
    const response = await fetch(`${backendUrl}/api/news/${slug}`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      return {
        title: "Bài viết không tồn tại - Consyf",
      };
    }
    
    const data = await response.json();
    const news = data.news;
    
    return {
      title: news.meta_title || news.title,
      description: news.meta_description || news.excerpt,
      keywords: news.meta_keywords,
      openGraph: {
        title: news.meta_title || news.title,
        description: news.meta_description || news.excerpt,
        images: news.og_image || news.thumbnail ? [news.og_image || news.thumbnail] : [],
        type: "article",
        publishedTime: news.published_at,
      },
      alternates: {
        canonical: news.canonical_url,
      },
    };
  } catch (error) {
    return {
      title: "Tin tức - Consyf",
    };
  }
}

export default async function NewsPage({ params }: PageProps) {
  const { slug } = await params;
  return <NewsDetailPage slug={slug} />;
}
