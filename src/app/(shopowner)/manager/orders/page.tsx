'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Clock, User, ShoppingBag } from 'lucide-react';
import { loadOrders, type Order } from '@/data/useOrderStore';

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const filtered = filterDate
    ? orders.filter((o) => o.createdAt.startsWith(filterDate))
    : orders;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center gap-4 px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/manager')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
        <div className="h-5 w-px bg-slate-200 shrink-0" />
        <h1 className="text-base font-bold text-slate-800 shrink-0">Lịch sử đơn hàng</h1>

        <div className="ml-auto flex items-center gap-3">
          <label className="text-sm text-slate-500 shrink-0">Lọc theo ngày:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 outline-none"
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="text-sm text-slate-400 hover:text-slate-600 transition"
            >
              Xóa lọc
            </button>
          )}
          <span className="text-sm text-slate-400">{filtered.length} đơn</span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 overflow-hidden px-6 py-5">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
            <Receipt size={48} strokeWidth={1.2} />
            <p className="text-sm font-medium">Chưa có đơn hàng nào được thanh toán</p>
          </div>
        ) : (
          <div className="h-full flex gap-5">
            {/* ── Cột trái: danh sách ── */}
            <div className="w-1/2 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-2 text-slate-300">
                  <Receipt size={36} strokeWidth={1.2} />
                  <p className="text-sm">Không có đơn nào trong ngày này</p>
                </div>
              ) : (
                filtered.map((order) => (
                  <button
                    key={order.orderId}
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-xl border text-left transition-all duration-150
                      ${selectedOrder?.orderId === order.orderId
                        ? 'border-rose-300 ring-1 ring-rose-200 shadow-sm'
                        : 'border-slate-100 hover:border-rose-200 hover:shadow-sm'
                      }`}
                  >
                    {/* Mã đơn */}
                    <div className="w-24 shrink-0">
                      <p className="text-[11px] text-slate-400 mb-0.5">Mã đơn</p>
                      <p className="text-xs font-semibold text-slate-700 font-mono truncate">
                        {order.orderId}
                      </p>
                    </div>

                    {/* Thời gian */}
                    <div className="flex-1 px-3">
                      <p className="text-[11px] text-slate-400 mb-0.5">Thời gian</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatTime(order.createdAt)}
                        <span className="text-xs text-slate-400 ml-1">{formatDate(order.createdAt)}</span>
                      </p>
                    </div>

                    {/* Loại đơn */}
                    <div className="w-20 text-center shrink-0">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.orderType === 'eat-in'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.orderType === 'eat-in' ? 'Tại chỗ' : 'Mang đi'}
                      </span>
                    </div>

                    {/* Tổng tiền */}
                    <div className="w-28 text-right shrink-0">
                      <p className="text-[11px] text-slate-400 mb-0.5">Tổng cộng</p>
                      <p className="text-sm font-bold text-rose-600">{formatPrice(order.total)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* ── Cột phải: chi tiết ── */}
            <div className="w-1/2">
              {selectedOrder ? (
                <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                  {/* Header của panel */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Chi tiết đơn hàng</p>
                      <p className="text-sm font-bold text-slate-800 font-mono">{selectedOrder.orderId}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Đã thanh toán
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="px-5 py-3 bg-slate-50 flex items-center gap-6 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={13} />
                      <span className="text-xs">{formatTime(selectedOrder.createdAt)} · {formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <User size={13} />
                      <span className="text-xs">{selectedOrder.cashier}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <ShoppingBag size={13} />
                      <span className="text-xs">{selectedOrder.orderType === 'eat-in' ? 'Tại chỗ' : 'Mang đi'}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto px-5 py-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Danh sách món ({selectedOrder.items.length})
                    </p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-400">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 ml-4 shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer tổng tiền */}
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">Tổng cộng</span>
                      <span className="text-lg font-bold text-rose-600">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300">
                  <Receipt size={40} strokeWidth={1.2} />
                  <p className="text-sm font-medium">Chọn đơn để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
