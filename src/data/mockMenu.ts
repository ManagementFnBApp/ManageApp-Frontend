import type { Product } from '@/apis/productApi';

// ── Categories ──────────────────────────────────────────────────────────────
// slug dùng cho POS filter, id dùng cho Menu management
export const MENU_CATEGORIES = [
  { id: 1,  slug: 'coffee',  label: 'Cà Phê'    },
  { id: 2,  slug: 'juice',   label: 'Nước Ép'   },
  { id: 3,  slug: 'soft',    label: 'Nước Ngọt' },
  { id: 4,  slug: 'yogurt',  label: 'Sữa Chua'  },
  { id: 5,  slug: 'topping', label: 'Topping'   },
  { id: -1, slug: 'other',   label: 'Khác'      },
];

// ── Helper: chuyển sang format POS ──────────────────────────────────────────
export function toPosProducts(products: Product[]) {
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.listPrice, // Dùng listPrice (giá bán) thay vì unitPrice
      categoryId: p.categoryId,
      categorySlug: MENU_CATEGORIES.find((c) => c.id === p.categoryId)?.slug ?? 'other',
      description: p.description ?? null,
    }));
}