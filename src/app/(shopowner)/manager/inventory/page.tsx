"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createInventory,
  createInventoryItem,
  deleteInventory,
  deleteInventoryItem,
  getInventories,
  getInventoryItems,
  normalizeApiError,
  updateInventory,
  updateInventoryItem,
  type Inventory,
  type InventoryItem,
} from "@/apis/inventory";
import { getProducts, type Product } from "@/apis/productApi";
import { getShopProducts } from "@/apis/shopProductApi";
import type { InventoryOption, ProductOption } from "./inventoryComponent";
import {
  AppModal,
  ConfirmDeleteModal,
  EmptyState,
  InventoryForm,
  InventoryItemForm,
  InventoryItemsFilterBar,
  InventoryItemTable,
  InventorySearchBar,
  InventoryTable,
  LoadingSpinner,
  StatCard,
  ToastMessage,
  type ToastType,
} from "./inventoryComponent";

interface ToastState {
  type: ToastType;
  message: string;
}

export default function InventoryPage() {
  const router = useRouter();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [systemProducts, setSystemProducts] = useState<Product[]>([]);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [currentShopId, setCurrentShopId] = useState<number | null>(null);

  const [shopIdFilter, setShopIdFilter] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [productIdFilter, setProductIdFilter] = useState("");
  const [appliedProductNameFilter, setAppliedProductNameFilter] = useState("");
  const [appliedProductIdFilter, setAppliedProductIdFilter] = useState<
    number | null
  >(null);

  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  const [inventoryModal, setInventoryModal] = useState<{
    open: boolean;
    mode: "create" | "update";
    data?: Inventory;
  }>({ open: false, mode: "create" });

  const [itemModal, setItemModal] = useState<{
    open: boolean;
    mode: "create" | "update";
    data?: InventoryItem;
  }>({ open: false, mode: "create" });

  const [confirmDeleteInventory, setConfirmDeleteInventory] =
    useState<Inventory | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<InventoryItem | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchInventories = useCallback(async (shopId?: number) => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const data = await getInventories(shopId);
      setInventories(data);
    } catch (error) {
      const err = normalizeApiError(error);
      setInventoryError(err.message);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const fetchItems = useCallback(
    async (params?: { inventoryId?: number; productId?: number }) => {
      setItemsLoading(true);
      setItemsError(null);
      try {
        const data = await getInventoryItems(params);
        setInventoryItems(data);
      } catch (error) {
        const err = normalizeApiError(error);
        setItemsError(err.message);
      } finally {
        setItemsLoading(false);
      }
    },
    [],
  );

  const fetchSystemProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const [system, shop] = await Promise.all([
        getProducts(true),
        getShopProducts(true),
      ]);
      setSystemProducts(system);
      setShopProducts(shop);
    } catch {
      // Product list is supportive for the form. Keep inventory page usable even if product API fails.
      setSystemProducts([]);
      setShopProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const inventoryProductOptions = useMemo<ProductOption[]>(
    () => [
      ...systemProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        source: "SYSTEM" as const,
      })),
      ...shopProducts.map((p) => ({
        id: p.productId,
        name: p.productName,
        source: "SHOP" as const,
      })),
    ],
    [shopProducts, systemProducts],
  );

  const inventoryOptions = useMemo<InventoryOption[]>(
    () =>
      inventories.map((inv) => ({
        inventoryId: inv.inventoryId,
        shopId: inv.shopId,
      })),
    [inventories],
  );

  const productNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of systemProducts) {
      map.set(`SYSTEM:${p.productId}`, p.productName);
    }
    for (const p of shopProducts) {
      map.set(`SHOP:${p.productId}`, p.productName);
    }
    return map;
  }, [shopProducts, systemProducts]);

  const productBarcodeByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of systemProducts) {
      map.set(`SYSTEM:${p.productId}`, p.barcode ?? "");
    }
    for (const p of shopProducts) {
      map.set(`SHOP:${p.productId}`, p.barcode ?? "");
    }
    return map;
  }, [shopProducts, systemProducts]);

  const resolveInventoryItemProductName = useCallback(
    (row: InventoryItem) => {
      const source = row.productType === "SHOP" ? "SHOP" : "SYSTEM";
      const id = source === "SHOP" ? row.shopProductId : row.productId;
      if (id == null) return "-";
      return productNameByKey.get(`${source}:${id}`) ?? `Product #${id}`;
    },
    [productNameByKey],
  );

  const resolveInventoryItemProductBarcode = useCallback(
    (row: InventoryItem) => {
      const source = row.productType === "SHOP" ? "SHOP" : "SYSTEM";
      const id = source === "SHOP" ? row.shopProductId : row.productId;
      if (id == null) return "-";
      return productBarcodeByKey.get(`${source}:${id}`) ?? "-";
    },
    [productBarcodeByKey],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("shopId");
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed) || parsed <= 0) {
      setCurrentShopId(null);
      setInventoryError("Không tìm thấy shopId. Vui lòng đăng nhập lại.");
      return;
    }
    setCurrentShopId(parsed);
    setShopIdFilter(String(parsed));
  }, []);

  useEffect(() => {
    if (!currentShopId) return;
    fetchInventories(currentShopId);
    fetchItems();
    fetchSystemProducts();
  }, [currentShopId, fetchInventories, fetchItems, fetchSystemProducts]);

  const currentShopInventoryIds = useMemo(
    () => new Set(inventories.map((inv) => inv.inventoryId)),
    [inventories],
  );

  const visibleInventoryItems = useMemo(
    () =>
      inventoryItems.filter((item) =>
        currentShopInventoryIds.has(item.inventoryId),
      ),
    [currentShopInventoryIds, inventoryItems],
  );

  const filteredInventoryItems = useMemo(() => {
    const keyword = appliedProductNameFilter.trim().toLowerCase();
    return visibleInventoryItems.filter((item) => {
      const matchById =
        appliedProductIdFilter == null ||
        item.productId === appliedProductIdFilter ||
        item.shopProductId === appliedProductIdFilter;

      const productName = resolveInventoryItemProductName(item).toLowerCase();
      const matchByName = keyword === "" || productName.includes(keyword);

      return matchById && matchByName;
    });
  }, [
    appliedProductIdFilter,
    appliedProductNameFilter,
    resolveInventoryItemProductName,
    visibleInventoryItems,
  ]);

  const totalInventory = inventories.length;
  const lowStockItems = inventories.filter(
    (item) => item.currentQuantity < item.minimumThreshold,
  ).length;
  const totalCurrentQty = inventories.reduce(
    (sum, item) => sum + (item.currentQuantity || 0),
    0,
  );

  const chartData = useMemo(
    () =>
      inventories.slice(0, 8).map((item) => ({
        name: `INV-${item.inventoryId}`,
        quantity: item.currentQuantity,
        threshold: item.minimumThreshold,
      })),
    [inventories],
  );

  const handleResetShop = async () => {
    if (!currentShopId) return;
    setShopIdFilter(String(currentShopId));
    await fetchInventories(currentShopId);
  };

  const handleSearchItem = async () => {
    const productId = Number(productIdFilter);
    if (productIdFilter && Number.isNaN(productId)) {
      showToast("error", "Product ID không hợp lệ.");
      return;
    }
    setAppliedProductIdFilter(productIdFilter ? productId : null);
    setAppliedProductNameFilter(productNameFilter.trim());
  };

  const handleResetItem = async () => {
    setProductNameFilter("");
    setProductIdFilter("");
    setAppliedProductNameFilter("");
    setAppliedProductIdFilter(null);
    await fetchItems();
  };

  const submitInventory = async (payload: {
    shopId: number;
    currentQuantity?: number;
    minimumThreshold?: number;
    reorderQuantity?: number;
    lastRestockAt?: string;
  }) => {
    try {
      setModalLoading(true);
      if (inventoryModal.mode === "create") {
        await createInventory(payload);
        showToast("success", "Tạo kho thành công.");
      } else if (inventoryModal.data) {
        await updateInventory(inventoryModal.data.inventoryId, payload);
        showToast("success", "Cập nhật kho thành công.");
      }

      setInventoryModal({ open: false, mode: "create" });
      await fetchInventories(currentShopId ?? undefined);
    } catch (error) {
      const err = normalizeApiError(error);
      showToast("error", err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const submitInventoryItem = async (payload: {
    productId?: number;
    shopProductId?: number;
    inventoryId: number;
    quantity?: number;
    reservedQuantity?: number;
  }) => {
    const requestPayload = {
      ...(payload.productId != null ? { productId: payload.productId } : {}),
      ...(payload.shopProductId != null
        ? { shopProductId: payload.shopProductId }
        : {}),
      inventoryId: payload.inventoryId,
      ...(payload.quantity != null ? { quantity: payload.quantity } : {}),
      ...(payload.reservedQuantity != null
        ? { reservedQuantity: payload.reservedQuantity }
        : {}),
    };

    try {
      setModalLoading(true);
      if (itemModal.mode === "create") {
        await createInventoryItem(requestPayload);
        showToast("success", "Thêm mục hàng trong kho thành công.");
      } else if (itemModal.data) {
        await updateInventoryItem(
          itemModal.data.inventoryItemId,
          requestPayload,
        );
        showToast("success", "Cập nhật mục hàng trong kho thành công.");
      }

      setItemModal({ open: false, mode: "create" });
      await fetchItems();
    } catch (error) {
      const err = normalizeApiError(error);
      showToast("error", err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeleteInventoryAction = async () => {
    if (!confirmDeleteInventory) return;

    const hasItemsInInventory = visibleInventoryItems.some(
      (item) => item.inventoryId === confirmDeleteInventory.inventoryId,
    );
    if (hasItemsInInventory) {
      showToast("error", "Kho đang có sản phẩm.Vui lòng xóa sản phẩm trước!");
      return;
    }

    try {
      setModalLoading(true);
      await deleteInventory(confirmDeleteInventory.inventoryId);
      showToast("success", "Đã xóa kho.");
      setConfirmDeleteInventory(null);
      await fetchInventories(currentShopId ?? undefined);
    } catch (error) {
      const err = normalizeApiError(error);
      showToast("error", err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeleteItemAction = async () => {
    if (!confirmDeleteItem) return;
    try {
      setModalLoading(true);
      await deleteInventoryItem(confirmDeleteItem.inventoryItemId);
      showToast("success", "Đã xóa mục hàng trong kho.");
      setConfirmDeleteItem(null);
      await fetchItems();
    } catch (error) {
      const err = normalizeApiError(error);
      showToast("error", err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {toast ? (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}

      <section className="mb-6 rounded-3xl border-2 border-black bg-gradient-to-r from-white to-blue-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý kho</h1>
        <p className="mt-1 text-sm text-slate-600">
          Quản lý tồn kho cho hệ thống F&B với giao diện tối giản và rõ ràng.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Tổng số kho" value={totalInventory} />
        <StatCard label="Mục hàng sắp hết" value={lowStockItems} subtle />
        <StatCard label="Tổng số lượng tồn" value={totalCurrentQty} subtle />
      </section>

      <section className="space-y-4">
        <InventorySearchBar
          shopId={shopIdFilter}
          onReset={handleResetShop}
          onCreate={() => setInventoryModal({ open: true, mode: "create" })}
        />

        {inventoryLoading ? (
          <LoadingSpinner message="Đang tải danh sách kho..." />
        ) : inventoryError ? (
          <EmptyState
            title="Không thể tải danh sách kho"
            description={inventoryError}
            action={
              <button
                type="button"
                onClick={() => fetchInventories(currentShopId ?? undefined)}
                className="rounded-xl border border-black px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Thử lại
              </button>
            }
          />
        ) : inventories.length === 0 ? (
          <EmptyState
            title="Chưa có kho"
            description="Hãy tạo kho đầu tiên để bắt đầu quản lý tồn kho."
          />
        ) : (
          <InventoryTable
            data={inventories}
            onView={(row) =>
              router.push(`/manager/inventory/${row.inventoryId}`)
            }
            onEdit={(row) =>
              setInventoryModal({ open: true, mode: "update", data: row })
            }
            onDelete={(row) => setConfirmDeleteInventory(row)}
          />
        )}
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Mục hàng trong kho</h2>
        <InventoryItemsFilterBar
          productName={productNameFilter}
          onProductNameChange={setProductNameFilter}
          productId={productIdFilter}
          onProductIdChange={setProductIdFilter}
          onSearch={handleSearchItem}
          onReset={handleResetItem}
          onCreate={() => setItemModal({ open: true, mode: "create" })}
        />

        {itemsLoading ? (
          <LoadingSpinner message="Đang tải danh sách item..." />
        ) : itemsError ? (
          <EmptyState
            title="Không thể tải mục hàng trong kho"
            description={itemsError}
            action={
              <button
                type="button"
                onClick={() => fetchItems()}
                className="rounded-xl border border-black px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Thử lại
              </button>
            }
          />
        ) : filteredInventoryItems.length === 0 ? (
          <EmptyState
            title="Chưa có mục hàng trong kho"
            description="Bạn có thể thêm mục hàng để quản lý số lượng theo từng sản phẩm."
          />
        ) : (
          <InventoryItemTable
            data={filteredInventoryItems}
            getProductName={resolveInventoryItemProductName}
            getProductBarcode={resolveInventoryItemProductBarcode}
            onEdit={(row) =>
              setItemModal({ open: true, mode: "update", data: row })
            }
            onDelete={(row) => setConfirmDeleteItem(row)}
          />
        )}
      </section>

      <AppModal
        open={inventoryModal.open}
        title={inventoryModal.mode === "create" ? "Tạo kho" : "Cập nhật kho"}
        onClose={() => setInventoryModal({ open: false, mode: "create" })}
      >
        <InventoryForm
          mode={inventoryModal.mode}
          initialValues={inventoryModal.data}
          fixedShopId={currentShopId ?? undefined}
          loading={modalLoading}
          onSubmit={submitInventory}
          onCancel={() => setInventoryModal({ open: false, mode: "create" })}
        />
      </AppModal>

      <AppModal
        open={itemModal.open}
        title={
          itemModal.mode === "create"
            ? "Thêm mục hàng trong kho"
            : "Cập nhật mục hàng trong kho"
        }
        onClose={() => setItemModal({ open: false, mode: "create" })}
      >
        <InventoryItemForm
          mode={itemModal.mode}
          initialValues={itemModal.data}
          productOptions={inventoryProductOptions}
          inventoryOptions={inventoryOptions}
          productsLoading={productsLoading}
          loading={modalLoading}
          onSubmit={submitInventoryItem}
          onCancel={() => setItemModal({ open: false, mode: "create" })}
        />
      </AppModal>

      <ConfirmDeleteModal
        open={Boolean(confirmDeleteInventory)}
        title="Xóa kho"
        description={`Bạn chắc chắn muốn xóa kho #${confirmDeleteInventory?.inventoryId ?? ""}?`}
        loading={modalLoading}
        onCancel={() => setConfirmDeleteInventory(null)}
        onConfirm={confirmDeleteInventoryAction}
      />

      <ConfirmDeleteModal
        open={Boolean(confirmDeleteItem)}
        title="Xóa mục hàng trong kho"
        description={`Bạn chắc chắn muốn xóa mục hàng #${confirmDeleteItem?.inventoryItemId ?? ""}?`}
        loading={modalLoading}
        onCancel={() => setConfirmDeleteItem(null)}
        onConfirm={confirmDeleteItemAction}
      />
    </div>
  );
}
