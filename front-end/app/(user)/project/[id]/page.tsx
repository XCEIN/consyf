import { Metadata } from "next";
import ProjectDetailClient from "./project-detail";

export const metadata: Metadata = {
  title: "Chi tiết dự án",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailClient projectId={id} />;
}
