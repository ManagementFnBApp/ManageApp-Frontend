"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Receipt,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Pencil,
  X,
} from "lucide-react";
import {
  getOrders,
  completeOrder,
  cancelOrder,
  updateOrder,
  type OrderResponse,
} from "@/apis/orderApi";
import { getStoredRoleNormalized } from "@/apis/auth";

// Map BE response to the shape used by this page
type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: { product_name: string };
};

type Order = {
  orderId: string;
  createdAt: string | null;
  total: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  shiftUserId: number;
  note: string | null;
  items: OrderItem[];
};

function toOrder(r: OrderResponse): Order {
  return {
    orderId: String(r.id),
    createdAt: r.createdAt ?? null,
    total: r.totalAmount,
    status: r.orderStatus as Order["status"],
    shiftUserId: r.shiftUserId,
    note: r.note,
    items: (r.order_items ?? []) as OrderItem[],
  };
}

type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "CANCELLED";

const STATUS_TABS: {
  key: StatusFilter;
  label: string;
  activeColor: string;
  countColor: string;
}[] = [
  {
    key: "ALL",
    label: "Tất cả",
    activeColor: "bg-slate-800 text-white",
    countColor: "bg-white/20",
  },
  {
    key: "PENDING",
    label: "Đang chờ",
    activeColor: "bg-amber-500 text-white",
    countColor: "bg-white/20",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    activeColor: "bg-emerald-600 text-white",
    countColor: "bg-white/20",
  },
  {
    key: "CANCELLED",
    label: "Đã huỷ",
    activeColor: "bg-rose-500 text-white",
    countColor: "bg-white/20",
  },
];

const STATUS_BADGE: Record<
  Order["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Đang chờ", className: "bg-amber-100 text-amber-700" },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-700",
  },
  CANCELLED: { label: "Đã huỷ", className: "bg-rose-100 text-rose-600" },
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " ₫";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrderId = searchParams?.get("new") ?? null;

  const [isShopOwner, setIsShopOwner] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'complete' | 'cancel' | 'update'
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    setIsShopOwner(getStoredRoleNormalized() === 'SHOPOWNER');
  }, []);

  // ── Edit modal state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    note: "",
    totalAmount: 0,
    shiftUserId: 0,
  });
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getOrders()
      .then((data) => {
        const mapped = data.map(toOrder);
        setOrders(mapped);
        // Auto-select and highlight the newly created order from POS
        if (newOrderId) {
          const found = mapped.find((o) => o.orderId === newOrderId);
          if (found) {
            setSelectedOrder(found);
            setActiveStatus("PENDING");
            setSuccessBanner(`Đơn hàng #${newOrderId} đã được tạo thành công với trạng thái Đang chờ.`);
          }
        }
      })
      .catch((err) => setError(err?.message ?? "Không thể tải đơn hàng"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bỏ chọn khi đổi tab
  useEffect(() => {
    setSelectedOrder(null);
    setConfirmCancel(false);
  }, [activeStatus]);

  // Reset confirm khi đổi đơn
  useEffect(() => {
    setConfirmCancel(false);
  }, [selectedOrder?.orderId]);

  const byStatus =
    activeStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeStatus);

  const filtered = filterDate
    ? byStatus.filter((o) => o.createdAt?.startsWith(filterDate))
    : byStatus;

  const countFor = (key: StatusFilter) =>
    key === "ALL"
      ? orders.length
      : orders.filter((o) => o.status === key).length;

  // ── Action handlers ──
  const handleComplete = async () => {
    if (!selectedOrder) return;
    setActionLoading("complete");
    try {
      await completeOrder(Number(selectedOrder.orderId));
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? { ...o, status: "COMPLETED" }
            : o,
        ),
      );
      setSelectedOrder((o) => (o ? { ...o, status: "COMPLETED" } : o));
    } catch (e: any) {
      alert(e?.message ?? "Không thể hoàn thành đơn");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    setActionLoading("cancel");
    try {
      await cancelOrder(Number(selectedOrder.orderId));
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? { ...o, status: "CANCELLED" }
            : o,
        ),
      );
      setSelectedOrder((o) => (o ? { ...o, status: "CANCELLED" } : o));
      setConfirmCancel(false);
    } catch (e: any) {
      alert(e?.message ?? "Không thể huỷ đơn");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = () => {
    if (!selectedOrder) return;
    setEditForm({
      note: selectedOrder.note ?? "",
      totalAmount: selectedOrder.total,
      shiftUserId: selectedOrder.shiftUserId,
    });
    setEditError(null);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    if (editForm.totalAmount <= 0) {
      setEditError("Tổng tiền phải lớn hơn 0");
      return;
    }
    setActionLoading("update");
    try {
      // Backend OrderDto yêu cầu order_items (bắt buộc) - gửi lại items hiện tại để tránh xóa
      await updateOrder(Number(selectedOrder.orderId), {
        note: editForm.note || undefined,
        totalAmount: editForm.totalAmount,
        shiftUserId: editForm.shiftUserId > 0 ? editForm.shiftUserId : undefined,
        order_items: selectedOrder.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder.orderId
            ? {
                ...o,
                note: editForm.note || null,
                total: editForm.totalAmount,
                shiftUserId: editForm.shiftUserId,
              }
            : o,
        ),
      );
      setSelectedOrder((o) =>
        o
          ? {
              ...o,
              note: editForm.note || null,
              total: editForm.totalAmount,
              shiftUserId: editForm.shiftUserId,
            }
          : o,
      );
      setEditOpen(false);
    } catch (e: any) {
      setEditError(e?.message ?? "Cập nhật thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* ── Header ── */}
        <header className="flex-shrink-0 flex items-center gap-4 px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => router.push("/manager")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <h1 className="text-base font-bold text-slate-800 shrink-0">
            Danh sách đặt hàng
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <label className="text-sm text-slate-500 shrink-0">
              Lọc theo ngày:
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 outline-none"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate("")}
                className="text-sm text-slate-400 hover:text-slate-600 transition"
              >
                Xóa lọc
              </button>
            )}
            <span className="text-sm text-slate-400">
              {filtered.length} đơn
            </span>
          </div>
        </header>

        {/* ── Success banner after POS checkout ── */}
        {successBanner && (
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-2.5 bg-emerald-50 border-b border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <CheckCircle size={16} />
              {successBanner}
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-emerald-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Status Tabs ── */}
        <div className="flex-shrink-0 flex items-center gap-2 px-6 pt-3 pb-0 bg-slate-50 border-b border-slate-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStatus(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-sm font-semibold border-b-2 transition-all
              ${
                activeStatus === tab.key
                  ? `${tab.activeColor} border-transparent shadow-sm`
                  : "bg-white text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-mono leading-none
                ${activeStatus === tab.key ? tab.countColor : "bg-slate-100 text-slate-500"}`}
              >
                {countFor(tab.key)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-hidden px-6 py-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-rose-400 rounded-full animate-spin" />
              <p className="text-sm">Đang tải đơn hàng…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-rose-400">
              <Receipt size={48} strokeWidth={1.2} />
              <p className="text-sm font-medium">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  getOrders()
                    .then((d) => setOrders(d.map(toOrder)))
                    .catch((e) => setError(e?.message ?? "Lỗi"))
                    .finally(() => setLoading(false));
                }}
                className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
              >
                Thử lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
              <Receipt size={48} strokeWidth={1.2} />
              <p className="text-sm font-medium">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="h-full flex gap-5">
              {/* ── Cột trái: danh sách ── */}
              <div className="w-1/2 overflow-y-auto flex flex-col gap-2.5 pr-1">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-2 text-slate-300">
                    <Receipt size={36} strokeWidth={1.2} />
                    <p className="text-sm">Không có đơn nào</p>
                  </div>
                ) : (
                  filtered.map((order) => (
                    <button
                      key={order.orderId}
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-xl border text-left transition-all duration-150
                      ${
                        selectedOrder?.orderId === order.orderId
                          ? "border-rose-300 ring-1 ring-rose-200 shadow-sm"
                          : "border-slate-100 hover:border-rose-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Mã đơn */}
                      <div className="w-20 shrink-0">
                        <p className="text-[11px] text-slate-400 mb-0.5">
                          Mã đơn
                        </p>
                        <p className="text-xs font-semibold text-slate-700 font-mono truncate">
                          #{order.orderId}
                        </p>
                      </div>

                      {/* Thời gian */}
                      <div className="flex-1 px-3">
                        <p className="text-[11px] text-slate-400 mb-0.5">
                          Thời gian
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {order.createdAt ? (
                            <>
                              {formatTime(order.createdAt)}
                              <span className="text-xs text-slate-400 ml-1">
                                {formatDate(order.createdAt)}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="w-24 text-center shrink-0">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            STATUS_BADGE[order.status]?.className ??
                            "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {STATUS_BADGE[order.status]?.label ?? order.status}
                        </span>
                      </div>

                      {/* Tổng tiền */}
                      <div className="w-28 text-right shrink-0">
                        <p className="text-[11px] text-slate-400 mb-0.5">
                          Tổng cộng
                        </p>
                        <p className="text-sm font-bold text-rose-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* ── Cột phải: chi tiết ── */}
              {/* ───────── RIGHT PANEL ───────── */}
<div className="w-1/2">
  {selectedOrder ? (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-2xl border shadow-sm overflow-hidden">

                    {/* Meta info */}
                    <div className="px-5 py-3 bg-slate-50 flex items-center gap-6 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={13} />
                        <span className="text-xs">
                          {selectedOrder.createdAt
                            ? `${formatTime(selectedOrder.createdAt)} · ${formatDate(selectedOrder.createdAt)}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={13} />
                        <span className="text-xs">
                          Ca #{selectedOrder.shiftUserId}
                        </span>
                      </div>
                    </div>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            STATUS_BADGE[selectedOrder.status]?.className ??
            "bg-slate-100 text-slate-500"
          }`}
        >
          {STATUS_BADGE[selectedOrder.status]?.label ??
            selectedOrder.status}
        </span>
      </div>

      {/* META */}
      <div className="px-5 py-3 bg-slate-50 flex gap-6 text-xs text-slate-500 border-b">
        <div className="flex items-center gap-1">
          <Clock size={13} />
          {selectedOrder.createdAt
            ? `${formatTime(selectedOrder.createdAt)} · ${formatDate(selectedOrder.createdAt)}`
            : "—"}
        </div>

        <div className="flex items-center gap-1">
          <User size={13} />
          User #{selectedOrder.userId}
        </div>
      </div>

                      {/* Action buttons — chỉ hiện khi PENDING */}
                      {selectedOrder.status === "PENDING" &&
                        (confirmCancel ? (
                          // ── Inline confirm huỷ đơn ──
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-center text-slate-600 font-medium">
                              Xác nhận huỷ đơn{" "}
                              <span className="font-bold text-rose-600">
                                #{selectedOrder.orderId}
                              </span>
                              ?
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmCancel(false)}
                                disabled={!!actionLoading}
                                className="flex-1 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-100 transition disabled:opacity-50"
                              >
                                Không, giữ lại
                              </button>
                              <button
                                type="button"
                                onClick={handleCancel}
                                disabled={!!actionLoading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition disabled:opacity-50"
                              >
                                <XCircle size={13} />
                                {actionLoading === "cancel"
                                  ? "Đang huỷ…"
                                  : "Xác nhận huỷ"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          // ── Normal action buttons ──
                          <div className="flex gap-2">
                            {/* Sửa đơn chỉ hiện với SHOPOWNER */}
                            {isShopOwner && (
                              <button
                                type="button"
                                onClick={openEdit}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-100 transition disabled:opacity-50"
                              >
                                <Pencil size={13} />
                                Sửa đơn
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleComplete}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                              <CheckCircle size={13} />
                              {actionLoading === "complete"
                                ? "Đang xử lý…"
                                : "Hoàn thành"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancel(true)}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              Huỷ đơn
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-white/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300">
                    <Receipt size={40} strokeWidth={1.2} />
                    <p className="text-sm font-medium">
                      Chọn đơn để xem chi tiết
                    </p>
                  </div>

                  <div className="text-right ml-3">
                    <p className="text-xs text-slate-400">
                      x{item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 bg-slate-50 border-t flex flex-col gap-4">

        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-600">
            Tổng cộng
          </span>

          <span className="text-lg font-bold text-rose-600">
            {formatPrice(selectedOrder.total)}
          </span>
        </div>

        {selectedOrder.status === "PENDING" && (
          <div className="flex gap-3">

            <button
              onClick={openEdit}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-white text-slate-600 hover:bg-slate-100"
            >
              <Pencil size={16} />
              Sửa
            </button>

            <button
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              <CheckCircle size={16} />
              Hoàn thành
            </button>

            <button
              onClick={(handleCancel)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold"
            >
              <XCircle size={16} />
              Huỷ
            </button>

          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="h-full bg-white/50 rounded-2xl border border-dashed flex flex-col items-center justify-center text-slate-300 gap-3">
      <Receipt size={40} strokeWidth={1.2} />
      <p className="text-sm font-medium">
        Chọn đơn để xem chi tiết
      </p>
    </div>
  )}
</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Order Modal ── */}
      {editOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">
                Sửa đơn #{selectedOrder.orderId}
              </h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Ghi chú đơn hàng…"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Ca làm việc (Shift User ID)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.shiftUserId}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      shiftUserId: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Tổng tiền (₫)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.totalAmount}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      totalAmount: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
              {editError && (
                <p className="text-xs text-rose-500">{editError}</p>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={actionLoading === "update"}
                className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {actionLoading === "update" ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}