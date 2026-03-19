"use client";

import { useState, useEffect, useCallback } from "react";
import { getCategories, createCategory } from "@/apis/categoryApi";
import {
  Badge,
  LoadingRow,
  EmptyRow,
  ErrorRow,
} from "@/features/admin/AdminTabsCommon";

export function CategoriesTab() {
  const [categories, setCategories] = useState<
    { id: number; categoryName: string; isActive: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getCategories();
      setCategories(
        list.map((c) => ({
          id: c.id,
          categoryName: c.categoryName,
          isActive: c.isActive,
        })),
      );
    } catch {
      setError("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) {
      setFormError("Tên danh mục không được trống");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const created = await createCategory({
        categoryName: name,
        isActive: true,
      });
      setCategories((prev) => [
        ...prev,
        {
          id: created.id,
          categoryName: created.categoryName,
          isActive: created.isActive ?? true,
        },
      ]);
      setShowForm(false);
      setCategoryName("");
    } catch (e: unknown) {
      setFormError(
        (e as { message?: string })?.message || "Tạo danh mục thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách danh mục
          </h2>
          <p className="text-sm text-gray-500">
            Shopowner sẽ chọn các danh mục này cho cửa hàng của họ.{" "}
            {categories.length} danh mục.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
        >
          <span>+</span> Thêm danh mục
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 bg-teal-50 border border-teal-100 rounded-2xl space-y-3"
        >
          <h3 className="font-semibold text-teal-800 mb-1">
            Tạo danh mục mới
          </h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên danh mục *
              </label>
              <input
                required
                type="text"
                placeholder="VD: Cà phê, Nước ép, Bánh ngọt"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {submitting ? "Đang tạo..." : "Tạo danh mục"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setCategoryName("");
                  setFormError("");
                }}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Tên danh mục</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <LoadingRow cols={3} />
            ) : error ? (
              <ErrorRow cols={3} message={error} onRetry={load} />
            ) : categories.length === 0 ? (
              <EmptyRow
                cols={3}
                message="Chưa có danh mục nào. Hãy tạo danh mục để Shopowner sử dụng."
              />
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 font-mono">
                    #{c.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.categoryName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={c.isActive ? "Hoạt động" : "Tắt"}
                      color={c.isActive ? "green" : "gray"}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
