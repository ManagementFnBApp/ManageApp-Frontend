"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProducts, type Product } from "@/apis/productApi";
import { savePosCart } from "@/lib/posCart";
import { decodeJwt, type UserJwtPayload } from "@/lib/jwt";

type OrderType = "eat-in" | "takeaway";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface PosProduct {
  id: number;
  name: string;
  price: number;
  categoryId: string;
}

interface CategoryFilter {
  id: string;
  label: string;
}

function getShift(hour: number): { label: string; range: string } {
  if (hour >= 7 && hour < 15) return { label: "Morning", range: "7h - 15h" };
  if (hour >= 15 && hour < 22)
    return { label: "Afternoon", range: "15h - 22h" };
  return { label: "Closed", range: "--" };
}

function buildCategories(products: Product[]): CategoryFilter[] {
  const ids = Array.from(new Set(products.map((p) => p.categoryId))).sort(
    (a, b) => a - b,
  );
  return [
    { id: "all", label: "Tất Cả" },
    ...ids.map((id) => ({
      id: String(id),
      label: `Danh mục #${id}`,
    })),
  ];
}

export default function PosPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("Nguyen Van A");
  const [userId, setUserId] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("eat-in");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([
    { id: "all", label: "Tất Cả" },
  ]);
  const [productError, setProductError] = useState<string | null>(null);

  const SHIFT_ID_STORAGE_KEY = "pos_current_shift_id";
  const [shiftId, setShiftId] = useState<number>(1);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftInput, setShiftInput] = useState<string>("1");

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getProducts(true)
      .then((apiProducts) => {
        const mapped: PosProduct[] = apiProducts
          .filter((p) => p.isActive)
          .map((p) => ({
            id: p.productId,
            name: p.productName,
            price: p.listPrice,
            categoryId: String(p.categoryId),
          }));
        setPosProducts(mapped);
        setCategories(buildCategories(apiProducts));
        setProductError(null);
      })
      .catch(() => {
        setProductError(
          "❌ Không tải được sản phẩm. Kiểm tra kết nối và thử lại.",
        );
      });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("username");
      if (name) setUsername(name);

      const savedShift = localStorage.getItem(SHIFT_ID_STORAGE_KEY);
      const parsed = savedShift ? parseInt(savedShift, 10) : 1;
      const validId = isNaN(parsed) || parsed < 1 ? 1 : parsed;
      setShiftId(validId);
      setShiftInput(String(validId));

      const token = localStorage.getItem("accessToken");
      const payload = token ? decodeJwt<UserJwtPayload>(token) : null;
      if (payload?.sub) setUserId(payload.sub);
    }
  }, []);

  const filteredProducts = posProducts.filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.categoryId === activeCategory;
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

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " VND";

  const handleCheckout = () => {
    if (cart.length === 0) return;

    savePosCart({
      items: cart.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
      orderType,
      shiftId,
      userId,
    });

    router.push("/checkout-order");
  };

  const handleSaveShiftId = () => {
    const parsed = parseInt(shiftInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      alert("Shift ID phải là số nguyên dương.");
      return;
    }
    setShiftId(parsed);
    if (typeof window !== "undefined") {
      localStorage.setItem(SHIFT_ID_STORAGE_KEY, String(parsed));
    }
    setShowShiftModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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

        <div className="flex items-center gap-2 ml-1">
          {currentTime ? (
            (() => {
              const shift = getShift(currentTime.getHours());
              return (
                <span className="text-sm text-gray-500">
                  Shift:{" "}
                  <span
                    className={`font-semibold ${
                      shift.label === "Morning"
                        ? "text-amber-500"
                        : shift.label === "Afternoon"
                          ? "text-blue-500"
                          : "text-gray-400"
                    }`}
                  >
                    {shift.label}
                  </span>
                  <span className="text-gray-400 ml-1">({shift.range})</span>
                </span>
              );
            })()
          ) : (
            <span className="text-sm text-gray-400">Shift: --</span>
          )}

          <button
            type="button"
            onClick={() => {
              setShiftInput(String(shiftId));
              setShowShiftModal(true);
            }}
            title="Nhấn để đặt Shift ID (cần khớp với DB)"
            className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition border border-amber-200"
          >
            Ca #{shiftId}
          </button>
        </div>

        <div className="flex-1" />

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
        <div className="flex-1 flex flex-col p-6 lg:max-w-[66.666%] min-h-0">
          {productError && (
            <div
              className={`mb-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0 ${
                productError.startsWith("⚠")
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span>{productError}</span>
              <button
                type="button"
                onClick={() => {
                  setProductError(null);
                  getProducts(true)
                    .then((apiProducts) => {
                      const mapped: PosProduct[] = apiProducts
                        .filter((p) => p.isActive)
                        .map((p) => ({
                          id: p.productId,
                          name: p.productName,
                          price: p.listPrice,
                          categoryId: String(p.categoryId),
                        }));
                      setPosProducts(mapped);
                      setCategories(buildCategories(apiProducts));
                    })
                    .catch(() =>
                      setProductError(
                        "❌ Không tải được sản phẩm. Kiểm tra kết nối và thử lại.",
                      ),
                    );
                }}
                className="ml-auto underline text-xs opacity-70 hover:opacity-100"
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === cat.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-col lg:flex-row lg:items-end gap-3 flex-shrink-0">
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

            <div className="w-full lg:w-64">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Loại đơn hàng
              </div>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOrderType("eat-in")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                    orderType === "eat-in"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Eat-in
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("takeaway")}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                    orderType === "takeaway"
                      ? "bg-amber-400 text-gray-900"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Take away
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="aspect-square rounded-lg bg-gray-200 mb-3 flex items-center justify-center text-gray-400 text-2xl">
                    ☕
                  </div>
                  <p className="font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-blue-600 font-semibold text-sm mt-1">
                    {formatPrice(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[33.333%] lg:min-w-[320px] border-l border-gray-200 bg-white flex flex-col min-h-0">
          <div className="flex-1 min-h-0 p-4 bg-green-50/80 overflow-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Chưa có món trong đơn
              </p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Tổng cộng:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6">
            <h3 className="font-bold text-gray-800 mb-1">Đặt Shift ID</h3>
            <p className="text-xs text-gray-400 mb-4">
              Nhập ID của ca làm việc trong DB (bảng{" "}
              <code className="bg-gray-100 px-1 rounded">shifts</code>).
              <br />
              <span className="text-amber-500 font-medium">⚠ HARDCODE</span> —
              cần khớp với DB.
            </p>
            <input
              type="number"
              min={1}
              value={shiftInput}
              onChange={(e) => setShiftInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveShiftId()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowShiftModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveShiftId}
                className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-semibold text-sm transition"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}