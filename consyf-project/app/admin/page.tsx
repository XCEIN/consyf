import { Metadata } from "next";
import AdminDashboardClient from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Quản lý dự án - Admin",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
