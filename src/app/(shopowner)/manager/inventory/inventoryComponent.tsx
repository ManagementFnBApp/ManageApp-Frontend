"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import type { Inventory, InventoryItem } from "@/apis/inventory";

export interface ProductOption {
  id: number;
  name: string;
  source: "SYSTEM" | "SHOP";
}

export interface InventoryOption {
  inventoryId: number;
  shopId: number;
}

export type ToastType = "success" | "error";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AppButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
      : variant === "danger"
        ? "bg-white text-red-600 border-red-600 hover:bg-red-50"
        : "bg-white text-slate-700 border-slate-400 hover:bg-slate-100";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

export function LoadingSpinner({
  message = "Đang tải dữ liệu...",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-3 text-sm text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/15 bg-white p-10 text-center">
      <Package className="mx-auto h-10 w-10 text-blue-500" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ToastMessage({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  const styleClass =
    type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : "border-red-300 bg-red-50 text-red-700";

  return (
    <div
      className={`fixed right-4 top-4 z-[90] max-w-sm rounded-xl border px-4 py-3 shadow-xl ${styleClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 hover:bg-black/5"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function AppModal({
  open,
  title,
  onClose,
  children,
  widthClass = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${widthClass} rounded-2xl border-2 border-black bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AppModal
      open={open}
      title={title}
      onClose={onCancel}
      widthClass="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <p>{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <AppButton variant="secondary" onClick={onCancel} disabled={loading}>
            Hủy
          </AppButton>
          <AppButton variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Xóa
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}

export function StatCard({
  label,
  value,
  subtle,
}: {
  label: string;
  value: string | number;
  subtle?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 bg-white p-4 ${subtle ? "border-black/15" : "border-black"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function InventoryInfoCard({ inventory }: { inventory: Inventory }) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoLine label="Inventory ID" value={inventory.inventoryId} />
        <InfoLine label="Shop ID" value={inventory.shopId} />
        <InfoLine label="Số lượng hiện tại" value={inventory.currentQuantity} />
        <InfoLine
          label="Mức tồn tối thiểu"
          value={inventory.minimumThreshold}
        />
        <InfoLine label="Số lượng nhập lại" value={inventory.reorderQuantity} />
        <InfoLine
          label="Lần nhập kho gần nhất"
          value={formatDateTime(inventory.lastRestockAt)}
        />
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function InventoryForm({
  mode,
  initialValues,
  fixedShopId,
  loading,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "update";
  initialValues?: Partial<Inventory>;
  fixedShopId?: number;
  loading?: boolean;
  onSubmit: (payload: {
    shopId: number;
    currentQuantity?: number;
    minimumThreshold?: number;
    reorderQuantity?: number;
    lastRestockAt?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [shopId, setShopId] = useState(
    String(fixedShopId ?? initialValues?.shopId ?? ""),
  );
  const [currentQuantity, setCurrentQuantity] = useState(
    String(initialValues?.currentQuantity ?? ""),
  );
  const [minimumThreshold, setMinimumThreshold] = useState(
    String(initialValues?.minimumThreshold ?? ""),
  );
  const [reorderQuantity, setReorderQuantity] = useState(
    String(initialValues?.reorderQuantity ?? ""),
  );
  const [lastRestockAt, setLastRestockAt] = useState(
    formatDateInputValue(initialValues?.lastRestockAt),
  );

  useEffect(() => {
    setShopId(String(fixedShopId ?? initialValues?.shopId ?? ""));
    setCurrentQuantity(String(initialValues?.currentQuantity ?? ""));
    setMinimumThreshold(String(initialValues?.minimumThreshold ?? ""));
    setReorderQuantity(String(initialValues?.reorderQuantity ?? ""));
    setLastRestockAt(formatDateInputValue(initialValues?.lastRestockAt));
  }, [fixedShopId, initialValues]);

  const canSubmit = useMemo(() => {
    return Number(shopId) > 0;
  }, [shopId]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      shopId: Number(shopId),
      currentQuantity:
        currentQuantity !== "" ? Number(currentQuantity) : undefined,
      minimumThreshold:
        minimumThreshold !== "" ? Number(minimumThreshold) : undefined,
      reorderQuantity:
        reorderQuantity !== "" ? Number(reorderQuantity) : undefined,
      lastRestockAt:
        mode === "update" && lastRestockAt
          ? new Date(lastRestockAt).toISOString()
          : undefined,
    };
    onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="rounded-xl border border-black/15 bg-slate-50 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Shop ID: <span className="font-bold">{shopId || "-"}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Số lượng hiện tại"
          type="number"
          value={currentQuantity}
          onChange={setCurrentQuantity}
        />
        <FormInput
          label="Mức tồn tối thiểu"
          type="number"
          value={minimumThreshold}
          onChange={setMinimumThreshold}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Số lượng nhập lại"
          type="number"
          value={reorderQuantity}
          onChange={setReorderQuantity}
        />
        {mode === "update" ? (
          <FormInput
            label="Ngày nhập kho gần nhất"
            type="date"
            value={lastRestockAt}
            onChange={setLastRestockAt}
          />
        ) : (
          <div />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <AppButton variant="secondary" onClick={onCancel} disabled={loading}>
          Hủy
        </AppButton>
        <AppButton type="submit" disabled={loading || !canSubmit}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {mode === "create" ? "Tạo kho" : "Lưu thay đổi"}
        </AppButton>
      </div>
    </form>
  );
}

export function InventoryItemForm({
  mode,
  initialValues,
  productOptions,
  inventoryOptions,
  productsLoading,
  loading,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "update";
  initialValues?: Partial<InventoryItem>;
  productOptions: ProductOption[];
  inventoryOptions: InventoryOption[];
  productsLoading?: boolean;
  loading?: boolean;
  onSubmit: (payload: {
    productId?: number;
    shopProductId?: number;
    inventoryId: number;
    quantity?: number;
    reservedQuantity?: number;
  }) => void;
  onCancel: () => void;
}) {
  const [productSelection, setProductSelection] = useState("");
  const [inventoryId, setInventoryId] = useState(
    String(initialValues?.inventoryId ?? ""),
  );
  const [quantity, setQuantity] = useState(
    String(initialValues?.quantity ?? ""),
  );
  const [reservedQuantity, setReservedQuantity] = useState(
    String(initialValues?.reservedQuantity ?? ""),
  );

  useEffect(() => {
    const initialSelection =
      initialValues?.productType === "SHOP" &&
      initialValues.shopProductId != null
        ? `SHOP:${initialValues.shopProductId}`
        : initialValues?.productId != null
          ? `SYSTEM:${initialValues.productId}`
          : initialValues?.shopProductId != null
            ? `SHOP:${initialValues.shopProductId}`
            : "";
    setProductSelection(initialSelection);
    setInventoryId(String(initialValues?.inventoryId ?? ""));
    setQuantity(String(initialValues?.quantity ?? ""));
    setReservedQuantity(String(initialValues?.reservedQuantity ?? ""));
  }, [initialValues]);

  const displayProducts = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const item of productOptions) {
      map.set(`${item.source}:${item.id}`, item);
    }

    // Keep selected value visible in update mode even when the product is no longer active.
    if (productSelection && !map.has(productSelection)) {
      const [source, id] = productSelection.split(":");
      const sourceLabel =
        source === "SHOP" ? "Sản phẩm cửa hàng" : "Sản phẩm hệ thống";
      map.set(productSelection, {
        source: source === "SHOP" ? "SHOP" : "SYSTEM",
        id: Number(id),
        name: `${sourceLabel} #${id} (không còn trong danh sách active)`,
      });
    }

    return Array.from(map.values());
  }, [productSelection, productOptions]);

  const displayInventories = useMemo(() => {
    const map = new Map<number, InventoryOption>();
    for (const item of inventoryOptions) {
      map.set(item.inventoryId, item);
    }

    const currentId = Number(inventoryId);
    if (currentId > 0 && !map.has(currentId)) {
      map.set(currentId, { inventoryId: currentId, shopId: -1 });
    }

    return Array.from(map.values());
  }, [inventoryId, inventoryOptions]);

  const canSubmit = useMemo(() => {
    return (
      Boolean(productSelection) &&
      Number(inventoryId) > 0 &&
      !productsLoading &&
      displayInventories.length > 0
    );
  }, [
    productSelection,
    inventoryId,
    productsLoading,
    displayInventories.length,
  ]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const [source, rawId] = productSelection.split(":");
    const selectedId = Number(rawId);

    onSubmit({
      productId: source === "SYSTEM" ? selectedId : undefined,
      shopProductId: source === "SHOP" ? selectedId : undefined,
      inventoryId: Number(inventoryId),
      quantity: quantity !== "" ? Number(quantity) : undefined,
      reservedQuantity:
        reservedQuantity !== "" ? Number(reservedQuantity) : undefined,
    });
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Sản phẩm
          </span>
          <select
            required
            value={productSelection}
            onChange={(e) => setProductSelection(e.target.value)}
            disabled={productsLoading}
            className="w-full rounded-xl border border-black/25 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {productsLoading ? "Đang tải sản phẩm..." : "Chọn sản phẩm"}
            </option>
            {displayProducts.map((p) => (
              <option key={`${p.source}:${p.id}`} value={`${p.source}:${p.id}`}>
                [{p.source === "SYSTEM" ? "Hệ thống" : "Cửa hàng"}] #{p.id} -{" "}
                {p.name}
              </option>
            ))}
          </select>
          {!productsLoading && displayProducts.length === 0 ? (
            <p className="mt-1 text-xs text-red-600">
              Chưa có product phù hợp. Hãy tạo product hệ thống hoặc shop
              product trước.
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Kho
          </span>
          <select
            required
            value={inventoryId}
            onChange={(e) => setInventoryId(e.target.value)}
            disabled={displayInventories.length === 0}
            className="w-full rounded-xl border border-black/25 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Chọn kho</option>
            {displayInventories.map((inv) => (
              <option key={inv.inventoryId} value={inv.inventoryId}>
                #{inv.inventoryId}
                {inv.shopId > 0
                  ? ` - Shop ${inv.shopId}`
                  : " - Không còn trong danh sách"}
              </option>
            ))}
          </select>
          {displayInventories.length === 0 ? (
            <p className="mt-1 text-xs text-red-600">
              Chưa có inventory nào thuộc shop hiện tại.
            </p>
          ) : null}
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Số lượng"
          type="number"
          value={quantity}
          onChange={setQuantity}
        />
        <FormInput
          label="Dự trữ"
          type="number"
          value={reservedQuantity}
          onChange={setReservedQuantity}
        />
      </div>
      <div className="flex justify-end gap-2">
        <AppButton variant="secondary" onClick={onCancel} disabled={loading}>
          Hủy
        </AppButton>
        <AppButton type="submit" disabled={loading || !canSubmit}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {mode === "create" ? "Thêm mục kho" : "Lưu mục kho"}
        </AppButton>
      </div>
    </form>
  );
}

function FormInput({
  label,
  type,
  value,
  onChange,
  required = false,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/25 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
      />
    </label>
  );
}

export function InventorySearchBar({
  shopId,
  onReset,
  onCreate,
}: {
  shopId: string;
  onReset: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xs">
          <p className="text-base font-semibold text-slate-900 mb-1.5">
            Shop ID: <span className="font-bold">{shopId || "-"}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton variant="secondary" onClick={onReset}>
            Đặt lại
          </AppButton>
          <AppButton onClick={onCreate}>
            <Plus size={14} />
            Tạo kho
          </AppButton>
        </div>
      </div>
    </div>
  );
}

export function InventoryItemsFilterBar({
  productName,
  onProductNameChange,
  productId,
  onProductIdChange,
  onSearch,
  onReset,
  onCreate,
}: {
  productName: string;
  onProductNameChange: (value: string) => void;
  productId: string;
  onProductIdChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid w-full grid-cols-1 gap-3 md:max-w-2xl md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Lọc theo tên sản phẩm
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              className="w-full rounded-xl border border-black/25 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Lọc theo Product ID
            </label>
            <input
              type="number"
              value={productId}
              onChange={(e) => onProductIdChange(e.target.value)}
              className="w-full rounded-xl border border-black/25 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
              placeholder="Nhập productId"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton variant="secondary" onClick={onReset}>
            Đặt lại
          </AppButton>
          <AppButton onClick={onSearch}>
            <Search size={14} />
            Lọc
          </AppButton>
          <AppButton onClick={onCreate}>
            <Plus size={14} />
            Thêm mục kho
          </AppButton>
        </div>
      </div>
    </div>
  );
}

export function InventoryTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Inventory[];
  onView: (row: Inventory) => void;
  onEdit: (row: Inventory) => void;
  onDelete: (row: Inventory) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-black bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 font-semibold text-slate-700">
                Inventory ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Shop ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Số lượng hiện tại
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Mức tồn tối thiểu
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Số lượng nhập lại
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Ngày nhập kho gần nhất
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isLowStock = row.currentQuantity < row.minimumThreshold;
              return (
                <tr
                  key={row.inventoryId}
                  className="border-b border-black/5 last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    #{row.inventoryId}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.shopId}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${isLowStock ? "text-red-600" : "text-slate-900"}`}
                  >
                    {row.currentQuantity}
                    {isLowStock ? (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700">
                        Low Stock
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.minimumThreshold}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.reorderQuantity}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDateTime(row.lastRestockAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <ActionBtn
                        onClick={() => onView(row)}
                        icon={<Eye size={14} />}
                        label="Xem"
                      />
                      <ActionBtn
                        onClick={() => onEdit(row)}
                        icon={<Pencil size={14} />}
                        label="Sửa"
                      />
                      <ActionBtn
                        onClick={() => onDelete(row)}
                        icon={<Trash2 size={14} />}
                        label="Xóa"
                        danger
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryItemTable({
  data,
  getProductName,
  getProductBarcode,
  onEdit,
  onDelete,
  showActions = true,
}: {
  data: InventoryItem[];
  getProductName?: (row: InventoryItem) => string;
  getProductBarcode?: (row: InventoryItem) => string;
  onEdit?: (row: InventoryItem) => void;
  onDelete?: (row: InventoryItem) => void;
  showActions?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-black bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr className="border-b border-black/10">
              <th className="px-4 py-3 font-semibold text-slate-700">
                Inventory Item ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Nguồn sản phẩm
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Product ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Tên sản phẩm
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Barcode
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Inventory ID
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Số lượng
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Dự trữ</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Cập nhật lúc
              </th>
              {showActions ? (
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Thao tác
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.inventoryItemId}
                className="border-b border-black/5 last:border-b-0"
              >
                <td className="px-4 py-3 font-semibold text-slate-900">
                  #{row.inventoryItemId}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {row.productType === "SHOP" ? "Cửa hàng" : "Hệ thống"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {row.productType === "SHOP"
                    ? row.shopProductId
                    : row.productId}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {getProductName?.(row) ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                  {getProductBarcode?.(row) ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">{row.inventoryId}</td>
                <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                <td className="px-4 py-3 text-slate-700">
                  {row.reservedQuantity}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDateTime(row.updatedAt)}
                </td>
                {showActions ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <ActionBtn
                        onClick={() => onEdit?.(row)}
                        icon={<Pencil size={14} />}
                        label="Sửa"
                      />
                      <ActionBtn
                        onClick={() => onDelete?.(row)}
                        icon={<Trash2 size={14} />}
                        label="Xóa"
                        danger
                      />
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  icon,
  label,
  danger = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
        danger
          ? "border-red-300 text-red-600 hover:bg-red-50"
          : "border-slate-300 text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
