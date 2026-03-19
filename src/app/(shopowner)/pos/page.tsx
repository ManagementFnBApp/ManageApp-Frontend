"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import { saveOrder, saveDraft, getDraft, clearDraft } from '@/data/useOrderStore';
import { createOrder, getOrders } from '@/apis/orderApi';
import { getMyShiftAssignmentsAsOwner } from '@/apis/shiftApi';
import { getStoredRoleNormalized } from '@/apis/auth';
import { getPosShopProducts } from '@/apis/shopProductApi';

type OrderType = "eat-in" | "takeaway";

interface CartItem {
  productId: number;
  shopProductId: number;
  name: string;
  price: number;
  quantity: number;
}

interface PosProduct {
  id: number;
  shopProductId: number;
  name: string;
  price: number;
  categoryId: number;
  image?: string;
}

interface CategoryFilter {
  id: string;
  label: string;
}


export default function PosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams?.get('table') || 'mang-di';

  const getShopId = (): number => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("shopId");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const stockKey = (shopId: number) => `local_inventory_v1:${shopId}`;
  const readStock = (shopId: number): Record<string, { quantity: number; minimumThreshold: number }> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(stockKey(shopId));
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, any>;
      const out: Record<string, { quantity: number; minimumThreshold: number }> = {};
      for (const [k, v] of Object.entries(parsed ?? {})) {
        out[String(k)] = {
          quantity: Number(v?.quantity ?? 0) || 0,
          minimumThreshold: Number(v?.minimumThreshold ?? 0) || 0,
        };
      }
      return out;
    } catch {
      return {};
    }
  };
  const writeStock = (shopId: number, stock: Record<string, any>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(stockKey(shopId), JSON.stringify(stock));
  };

  const [username, setUsername] = useState<string>('Nguyen Van A');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('eat-in');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([
    { id: "all", label: "Tất Cả" },
  ]);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activeShiftUserId, setActiveShiftUserId] = useState<number | null>(null);
  const [shiftLoadError, setShiftLoadError] = useState<string | null>(null);
  // Khi STAFF không tự lấy được shiftUserId → cho phép nhập thủ công
  const [manualShiftId, setManualShiftId] = useState('');
  // Track whether draft load has completed - using state (not ref) so the auto-clear effect
  // only runs AFTER the re-render caused by setDraftLoadDone(true), ensuring cart state
  // has already been updated with draft items before the empty-check fires.
  const [draftLoadDone, setDraftLoadDone] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const products = await getPosShopProducts(true);
        setPosProducts(products);

        const uniqueCategories = Array.from(
          new Map(
            products
              .filter((p) => p.categoryId)
              .map((p) => [
                String(p.categoryId),
                p.categoryName?.trim() || `Danh mục ${p.categoryId}`,
              ]),
          ).entries(),
        )
          .map(([id, label]) => ({ id, label }))
          .sort((a, b) => a.label.localeCompare(b.label, "vi"));

        setCategories([
          { id: "all", label: "Tất Cả" },
          ...uniqueCategories,
        ]);
      } catch (err) {
        console.error("Không thể tải sản phẩm POS", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("username");
      if (name) setUsername(name);
    }
  }, []);

  // Fetch active shift user ID
  // - SHOPOWNER: gọi GET /shifts/users rồi lọc theo userId của mình
  // - STAFF: gọi GET /shifts/users/staff/:userId; nếu không có ca thì fallback đơn gần nhất
  useEffect(() => {
    (async () => {
      const role = getStoredRoleNormalized();
      const userId = Number(
        typeof window !== 'undefined' ? localStorage.getItem('userId') : '0',
      );

      if (userId > 0) {
        try {
          if (role === 'SHOPOWNER') {
            const myShifts = await getMyShiftAssignmentsAsOwner(userId);
            if (myShifts.length > 0) {
              setActiveShiftUserId(myShifts[0].id);
              setShiftLoadError(null);
              return;
            }
          }
        } catch {
          // Ignore and fallback to orders
        }
      }

      // STAFF hoặc SHOPOWNER chưa có ca (hoặc load thất bại) → lấy từ đơn hàng gần nhất
      try {
        const orders = await getOrders();
        if (orders.length > 0) {
          setActiveShiftUserId(orders[0].shiftUserId);
          setShiftLoadError(null);
        } else {
          setShiftLoadError(
            'Bạn chưa được phân ca. Vui lòng liên hệ quản lý để được gán ca làm việc.',
          );
        }
      } catch {
        setShiftLoadError(
          'Bạn chưa được phân ca. Vui lòng liên hệ quản lý để được gán ca làm việc.',
        );
      }
    })();
  }, []);

  // Load saved draft for this table when component mounts
  useEffect(() => {
    if (tableId) {
      const draft = getDraft(tableId);
      if (draft && draft.items && draft.items.length > 0) {
        const cartItems = draft.items.map(item => ({
          productId: item.productId,
          shopProductId: item.shopProductId ?? item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));
        setCart(cartItems);
      }
    }
    // Setting this state causes a re-render. The auto-clear effect below will only
    // fire AFTER that re-render, so cart will already have the draft items by then.
    setDraftLoadDone(true);
  }, [tableId]);

  // Auto-clear draft when cart becomes empty AFTER initial draft load.
  // Using draftLoadDone (state, not ref) ensures this only runs after the re-render
  // triggered by setDraftLoadDone(true), by which time setCart has already applied.
  useEffect(() => {
    if (!draftLoadDone) return;
    if (cart.length === 0 && tableId) {
      clearDraft(tableId);
    }
  }, [cart, draftLoadDone, tableId]);

  const filteredProducts = posProducts.filter((p) => {
    const matchCategory =
      activeCategory === "all" || String(p.categoryId) === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          shopProductId: product.shopProductId,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + delta }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    // clearDraft is handled by the cart useEffect above
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " VND";

  const handleSaveOrder = () => {
    try {
      if (cart.length === 0) {
        // Empty cart → clear draft (discard order for this table)
        clearDraft(tableId);
        setCheckoutError(null);
        alert("Đã xóa đơn hàng. Bàn đã được giải phóng.");
        return;
      }

      saveDraft(tableId, {
        items: cart,
        total,
        cashier: username,
      });

      setCheckoutError(null);
      alert("Đơn hàng đã được lưu! Tiếp tục chỉnh sửa hoặc thanh toán.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lưu đơn';
      setCheckoutError(errorMessage);
      console.error("Save order error:", error);
    }
  };

  const handleConfirmManualShift = () => {
    const id = Number(manualShiftId.trim());
    if (!id || id <= 0) return;
    setActiveShiftUserId(id);
    setShiftLoadError(null);
    setManualShiftId('');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!activeShiftUserId) {
      setCheckoutError(shiftLoadError ?? 'Chưa có ca làm việc. Vui lòng liên hệ quản lý.');
      return;
    }

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const shopId = getShopId();
      const currentStock = shopId ? readStock(shopId) : {};

      // Build order items payload — dùng shop_product_id (sản phẩm của shop)
      const orderItems = cart.map((item) => ({
        shop_product_id: item.shopProductId,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      // Call API to create order on backend
      const response = await createOrder({
        shiftUserId: activeShiftUserId,
        totalAmount: total,
        order_items: orderItems,
        note: `${orderType === 'eat-in' ? 'Ăn tại chỗ' : 'Mang đi'} - ${username} - Bàn ${tableId}`,
      });

      // ── Trừ tồn kho local theo shopProductId ──
      try {
        if (shopId > 0) {
          const next: Record<string, any> = { ...currentStock } as any;
          for (const ci of cart) {
            const key = String(ci.shopProductId);
            const row = next[key] ?? { quantity: 0, minimumThreshold: 0 };
            const q = Number(row.quantity ?? 0) || 0;
            next[key] = {
              ...row,
              quantity: Math.max(0, q - ci.quantity),
              updatedAt: new Date().toISOString(),
            };
          }
          writeStock(shopId, next);
        }
      } catch (invErr) {
        // Không chặn thanh toán nếu trừ tồn thất bại, vì order đã tạo thành công.
        console.warn("Inventory decrement failed:", invErr);
      }

      // Mark table as active in order history
      saveOrder({
        orderId: `ORD-${response.id}`,
        createdAt: new Date().toISOString(),
        items: cart,
        total,
        orderType,
        cashier: username,
        status: "PENDING",
      });

      // Clear cart and remove draft
      setCart([]);
      clearDraft(tableId);

      // Navigate to orders page so user can see the new PENDING order
      router.push(`/manager/orders?new=${response.id}`);
    } catch (error: unknown) {
      // Extract readable error message from Axios or standard Error
      let errorMessage = 'Lỗi khi thanh toán';
      if (error && typeof error === 'object') {
        const axiosErr = error as { response?: { data?: { message?: unknown } }; message?: string };
        const backendMsg = axiosErr.response?.data?.message;
        if (backendMsg) {
          errorMessage = Array.isArray(backendMsg) ? backendMsg.join(', ') : String(backendMsg);
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message;
        }
      }
      setCheckoutError(errorMessage);
      console.error("Checkout error:", (error as { response?: unknown } | null | undefined)?.response ?? error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-200">
        <button
          type="button"
          onClick={() => router.push("/manager")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
        <div className="h-6 w-px bg-gray-200 shrink-0" />
        <span className="text-base font-bold text-gray-900 shrink-0">
          POS System
        </span>

        {/* Shift indicator */}
        <div className="flex items-center gap-2 ml-1">
          {activeShiftUserId ? (
            <button
              type="button"
              onClick={() => { setActiveShiftUserId(null); setShiftLoadError('Nhập thủ công mã ca bên dưới.'); }}
              title="Đổi ca"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition"
            >
              <span className="text-xs font-medium">Ca #{activeShiftUserId}</span>
              <span className="text-[10px] text-emerald-400">✎</span>
            </button>
          ) : shiftLoadError ? (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Chưa có ca
            </span>
          ) : (
            <span className="text-xs text-gray-400">Đang tải ca...</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clock */}
        {currentTime && (
          <div className="hidden sm:flex flex-col items-center px-3 py-1 bg-gray-50 rounded-lg border border-gray-200 min-w-[90px]">
            <span className="text-lg font-bold text-gray-800 tabular-nums tracking-tight leading-tight">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
            <span className="text-[11px] text-gray-400 leading-tight">
              {currentTime.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-2 py-1 pl-1 pr-3 rounded-full bg-gray-100">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs">
            {(username || "S").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
            {username}
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left column - Products (kéo dài theo chiều cao cột món đã chọn) */}
        <div className="flex-1 flex flex-col p-6 lg:max-w-[66.666%] min-h-0">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Order type row */}
          <div className="mb-4 flex flex-col lg:flex-row lg:items-end gap-3 flex-shrink-0">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">
                Tìm kiếm sản phẩm :
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Order type - moved ngang với tìm kiếm sản phẩm */}
            <div className="w-full lg:w-64">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Loại đơn hàng
              </div>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOrderType("eat-in")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${orderType === "eat-in"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Eat-in
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("takeaway")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${orderType === "takeaway"
                    ? "bg-amber-400 text-gray-900"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  Take away
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="text-center bg-white rounded-lg border border-gray-200 p-2 hover:shadow-md hover:border-blue-200 transition flex flex-col items-center"
              >
                <div className="w-28 h-28 rounded-lg bg-gray-200 mb-2 flex items-center justify-center text-gray-400 overflow-hidden">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.textContent = '☕';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-2xl">☕</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 line-clamp-1 text-sm">
                  {product.name}
                </p>
                <p className="text-blue-600 font-semibold text-sm">
                  {formatPrice(product.price)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right column - Order summary (cùng chiều cao với cột trái) */}
        <div className="w-full lg:w-[33.333%] lg:min-w-[320px] border-l border-gray-200 bg-white flex flex-col min-h-0">
          {/* Order items - light green area */}
          <div className="flex-1 min-h-0 p-4 bg-green-50/80 overflow-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium">Đơn trống</p>
                <p className="text-xs text-gray-400">Chọn món để thêm vào đơn</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{cart.length} món</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                  >
                    <Trash2 size={12} />
                    Xóa đơn
                  </button>
                </div>
                <ul className="space-y-2">
                  {cart.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          title="Xóa món này"
                          className="w-7 h-7 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition ml-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Bottom - total & checkout */}
          <div className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Tổng cộng:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>
            {shiftLoadError && !activeShiftUserId && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-amber-700 text-xs font-medium mb-2">
                  ⚠ Không tìm được ca làm việc tự động.
                </p>
                <p className="text-amber-600 text-xs mb-2">
                  Liên hệ SHOPOWNER để lấy <strong>Mã ca (Assignment ID)</strong> từ trang Ca làm việc.
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={manualShiftId}
                    onChange={(e) => setManualShiftId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmManualShift()}
                    placeholder="Nhập mã ca..."
                    className="flex-1 text-xs px-2 py-1.5 border border-amber-300 rounded bg-white focus:ring-1 focus:ring-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmManualShift}
                    disabled={!manualShiftId.trim() || Number(manualShiftId) <= 0}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded transition disabled:opacity-50"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
            {checkoutError && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {checkoutError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={isCheckoutLoading}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${cart.length === 0
                  ? 'bg-red-400 hover:bg-red-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCheckoutLoading ? 'Đang xử lý...' : cart.length === 0 ? 'Xóa đơn' : 'Lưu đơn'}
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckoutLoading}
                className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isCheckoutLoading ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}