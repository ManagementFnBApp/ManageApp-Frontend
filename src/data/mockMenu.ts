import type { Product } from '@/apis/productApi';

// ── Categories ──────────────────────────────────────────────────────────────
// slug dùng cho POS filter, id dùng cho Menu management
export const MENU_CATEGORIES = [
  { id: 1, slug: 'coffee',  label: 'Cà Phê'    },
  { id: 2, slug: 'juice',   label: 'Nước Ép'   },
  { id: 3, slug: 'soft',    label: 'Nước Ngọt' },
  { id: 4, slug: 'yogurt',  label: 'Sữa Chua'  },
  { id: 5, slug: 'topping', label: 'Topping'   },
];

// ── Shared mock products ─────────────────────────────────────────────────────
// isActive: true  → hiển thị trên POS
// isActive: false → chỉ thấy trong quản lý menu (ngừng bán)
const now = new Date().toISOString();

export const MOCK_MENU_PRODUCTS: Product[] = [
  // Cà Phê
  { productId: 1,  categoryId: 1, productName: 'Milk Coffee',    sku: 'CF-001', barcode: null,             description: 'Cà phê sữa pha phin truyền thống', measureUnit: 'ly',    basicPrice: 18000, unitPrice: 29000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 2,  categoryId: 1, productName: 'Black Coffee',   sku: 'CF-002', barcode: null,             description: 'Cà phê đen đậm, không đường',      measureUnit: 'ly',    basicPrice: 14000, unitPrice: 22000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 3,  categoryId: 1, productName: 'Iced Milk',      sku: 'CF-003', barcode: null,             description: 'Sữa tươi pha lạnh thơm béo',        measureUnit: 'ly',    basicPrice: 16000, unitPrice: 26000, isActive: true,  createdAt: now, updatedAt: now },
  // Nước Ép
  { productId: 4,  categoryId: 2, productName: 'Orange Juice',   sku: 'JC-001', barcode: null,             description: 'Nước cam vắt tươi nguyên chất',     measureUnit: 'ly',    basicPrice: 15000, unitPrice: 25000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 5,  categoryId: 2, productName: 'Peach Tea',      sku: 'JC-002', barcode: null,             description: 'Trà đào thơm mát, đá xay',          measureUnit: 'ly',    basicPrice: 17000, unitPrice: 28000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 6,  categoryId: 2, productName: 'Lemonade',       sku: 'JC-003', barcode: null,             description: 'Chanh dây tươi pha muối ớt',        measureUnit: 'ly',    basicPrice: 12000, unitPrice: 20000, isActive: true,  createdAt: now, updatedAt: now },
  // Nước Ngọt
  { productId: 7,  categoryId: 3, productName: 'Coca Cola',      sku: 'SD-001', barcode: '049000006344',   description: 'Coca Cola lon 330ml',               measureUnit: 'lon',   basicPrice:  8000, unitPrice: 15000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 8,  categoryId: 3, productName: 'Sprite',         sku: 'SD-002', barcode: '049000006361',   description: 'Sprite lon 330ml',                  measureUnit: 'lon',   basicPrice:  8000, unitPrice: 15000, isActive: false, createdAt: now, updatedAt: now },
  // Sữa Chua
  { productId: 9,  categoryId: 4, productName: 'Yogurt Matcha',  sku: 'YG-001', barcode: null,             description: 'Sữa chua matcha Nhật trộn granola', measureUnit: 'hũ',    basicPrice: 20000, unitPrice: 32000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 10, categoryId: 4, productName: 'Yogurt Dâu',     sku: 'YG-002', barcode: null,             description: 'Sữa chua dâu tươi tự làm',          measureUnit: 'hũ',    basicPrice: 18000, unitPrice: 30000, isActive: true,  createdAt: now, updatedAt: now },
  // Topping
  { productId: 11, categoryId: 5, productName: 'Bubble Topping', sku: 'TP-001', barcode: null,             description: 'Trân châu đen nấu mềm dai',         measureUnit: 'phần',  basicPrice:  3000, unitPrice:  5000, isActive: true,  createdAt: now, updatedAt: now },
  { productId: 12, categoryId: 5, productName: 'Thạch Cà Phê',   sku: 'TP-002', barcode: null,             description: 'Thạch cà phê đắng nhẹ',             measureUnit: 'phần',  basicPrice:  3000, unitPrice:  5000, isActive: true,  createdAt: now, updatedAt: now },
];

// ── Helper: chuyển sang format POS ──────────────────────────────────────────
export function toPosProducts(products: Product[]) {
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.unitPrice,
      categoryId: MENU_CATEGORIES.find((c) => c.id === p.categoryId)?.slug ?? 'other',
    }));
}
