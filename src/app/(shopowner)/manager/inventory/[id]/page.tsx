"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getInventoryById,
  getInventoryItems,
  normalizeApiError,
  type Inventory,
  type InventoryItem,
} from "@/apis/inventory";
import { getProducts, type Product } from "@/apis/productApi";
import { getShopProducts } from "@/apis/shopProductApi";
import {
  EmptyState,
  InventoryInfoCard,
  InventoryItemTable,
  LoadingSpinner,
} from "../inventoryComponent";

export default function InventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const inventoryId = Number(params.id);

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [systemProducts, setSystemProducts] = useState<Product[]>([]);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inventoryId || Number.isNaN(inventoryId)) {
      setError("Inventory ID không hợp lệ.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [inventoryData, itemData] = await Promise.all([
          getInventoryById(inventoryId),
          getInventoryItems({ inventoryId }),
        ]);
        setInventory(inventoryData);
        setItems(itemData);

        const [system, shop] = await Promise.all([
          getProducts(true),
          getShopProducts(true),
        ]);
        setSystemProducts(system);
        setShopProducts(shop);
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [inventoryId]);

  const resolveProductName = (row: InventoryItem): string => {
    const list = row.productType === "SHOP" ? shopProducts : systemProducts;
    const id = row.productType === "SHOP" ? row.shopProductId : row.productId;
    if (id == null) return "-";
    return (
      list.find((p) => p.productId === id)?.productName ?? `Product #${id}`
    );
  };

  const resolveProductBarcode = (row: InventoryItem): string => {
    const list = row.productType === "SHOP" ? shopProducts : systemProducts;
    const id = row.productType === "SHOP" ? row.shopProductId : row.productId;
    if (id == null) return "-";
    return list.find((p) => p.productId === id)?.barcode ?? "-";
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết kho</h1>
          <p className="text-sm text-slate-600">
            Chi tiết tồn kho và các mục hàng theo kho.
          </p>
        </div>
        <Link
          href="/manager/inventory"
          className="inline-flex items-center gap-2 rounded-xl border border-black px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tải chi tiết kho..." />
      ) : error ? (
        <EmptyState title="Không tải được kho" description={error} />
      ) : !inventory ? (
        <EmptyState
          title="Kho không tồn tại"
          description="Dữ liệu có thể đã bị xóa hoặc không hợp lệ."
        />
      ) : (
        <div className="space-y-6">
          <InventoryInfoCard inventory={inventory} />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              Mục hàng trong kho
            </h2>
            {items.length === 0 ? (
              <EmptyState
                title="Kho chưa có mục hàng"
                description="Bạn có thể thêm mục hàng ở trang Quản lý kho."
              />
            ) : (
              <InventoryItemTable
                data={items}
                showActions={false}
                getProductName={resolveProductName}
                getProductBarcode={resolveProductBarcode}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
