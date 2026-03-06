import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '@/apis/categoryApi';
import { MENU_CATEGORIES } from '@/data/mockMenu';

export interface CategoryOption {
  id: number;
  slug: string;
  label: string;
}

const STORAGE_KEY = 'pos_categories';

function saveToStorage(categories: CategoryOption[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function loadFromCache(): CategoryOption[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CategoryOption[];
  } catch { /* ignore */ }
  return null;
}

// Fallback: danh mục được hardcode từ mockMenu, dùng khi API không có sẵn
const FALLBACK_CATEGORIES: CategoryOption[] = MENU_CATEGORIES.map((c) => ({
  id: c.id,
  slug: c.slug,
  label: c.label,
}));

/**
 * useCategoryStore – Hook tải danh mục từ BE API.
 * Nếu API lỗi, sử dụng fallback hardcode từ mockMenu.
 * Cache vào localStorage để tránh trống UI khi chờ API.
 */
export function useCategoryStore() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hiển thị cache trước để UI không trống trong khi chờ
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      setCategories(cached);
    } else {
      setCategories(FALLBACK_CATEGORIES);
    }

    // Fetch từ API — nguồn chính
    getCategories()
      .then((apiCategories) => {
        const mapped: CategoryOption[] = apiCategories.map((c) => ({
          id: c.categoryId,
          slug: c.slug ?? `cat-${c.categoryId}`,
          label: c.categoryName,
        }));
        setCategories(mapped);
        saveToStorage(mapped);
        setError(null);
      })
      .catch(() => {
        // Giữ nguyên fallback/cache khi API lỗi
        setError('Không thể tải danh mục từ máy chủ. Đang dùng danh mục mặc định.');
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    getCategories()
      .then((apiCategories) => {
        const mapped: CategoryOption[] = apiCategories.map((c) => ({
          id: c.categoryId,
          slug: c.slug ?? `cat-${c.categoryId}`,
          label: c.categoryName,
        }));
        setCategories(mapped);
        saveToStorage(mapped);
        setError(null);
      })
      .catch(() => setError('Không thể tải danh mục từ máy chủ. Đang dùng danh mục mặc định.'))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error, refresh };
}
