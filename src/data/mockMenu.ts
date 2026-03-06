import type { Product } from '@/apis/productApi';

// ── Fallback categories ──────────────────────────────────────────────────────
// Dùng làm dự phòng khi API /categories chưa có hoặc lỗi.
// Nguồn dữ liệu chính là BE API (xem useCategoryStore).
// slug dùng cho POS filter, id phải khớp với categoryId trong DB.
export const MENU_CATEGORIES = [
  { id: 1, slug: 'coffee',  label: 'Cà Phê'    },
  { id: 2, slug: 'juice',   label: 'Nước Ép'   },
  { id: 3, slug: 'soft',    label: 'Nước Ngọt' },
  { id: 4, slug: 'yogurt',  label: 'Sữa Chua'  },
  { id: 5, slug: 'topping', label: 'Topping'   },
];

// ── Helper: chuyển sang format POS ──────────────────────────────────────────
// categorySlugMap cho phép truyền vào bản đồ slug từ danh mục động (useCategoryStore)
// thay vì dùng MENU_CATEGORIES hardcode.
export function toPosProducts(
  products: Product[],
  categorySlugMap?: Map<number, string>,
) {
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.listPrice, // Dùng listPrice (giá bán)
      categoryId: categorySlugMap?.get(p.categoryId)
        ?? MENU_CATEGORIES.find((c) => c.id === p.categoryId)?.slug
        ?? 'other',
    }));
}
