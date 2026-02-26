import { Metadata } from "next";
import CategoriesManagementSection from "./categories-management-section";

export const metadata: Metadata = {
  title: "Quản lý danh mục - Admin",
  description: "Quản lý danh mục tin tức",
};

export default function CategoriesPage() {
  return <CategoriesManagementSection />;
}
