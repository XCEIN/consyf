"use client";
import PostForm from "@/components/shared/form/post-form";

export default function PostSection() {
  // In a real app, company_id comes from auth profile
  const fakeCompanyId = 1;
  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-semibold mb-2">Đăng bài</h2>
      <PostForm companyId={fakeCompanyId} />
    </div>
  );
}
