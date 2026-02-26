"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  GripVertical,
  Save,
  X,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

const defaultForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
};

// Helper to convert name to slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export default function CategoriesManagementSection() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(defaultForm);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/news-categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...defaultForm,
      sort_order: categories.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sort_order: category.sort_order,
    });
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    if (!form.slug.trim()) {
      alert("Vui lòng nhập slug");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      if (editingId) {
        await axios.put(
          `http://localhost:4000/api/news-categories/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:4000/api/news-categories",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Save category error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:4000/api/news-categories/${deleteModal.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteModal({ open: false, id: null });
      fetchCategories();
    } catch (error: any) {
      console.error("Delete category error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:gap-12 py-12">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/news")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
            <p className="text-gray-600 mt-1">
              {categories.length} danh mục
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có danh mục nào
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tên danh mục
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">
                  Thứ tự
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-32">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">
                    {category.description || "-"}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-600">
                    {category.sort_order}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: category.id })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="VD: Tin tức"
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  placeholder="VD: tin-tuc"
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /news?category={form.slug || "slug"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả ngắn về danh mục..."
                  rows={3}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
