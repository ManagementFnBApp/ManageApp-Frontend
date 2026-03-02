"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadPosCart, clearPosCart } from "@/lib/posCart";
import type { PosCartPayload } from "@/lib/posCart";
import { createOrder } from "@/apis/orderApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: "CASH", label: "Tiền mặt", icon: "💵" },
  { id: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng", icon: "🏦" },
  { id: "MOMO", label: "Ví MoMo", icon: "📱" },
  { id: "VNPAY", label: "VNPay", icon: "💳" },
];

type Step = "loading" | "form" | "processing" | "success" | "error" | "empty";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + " VND";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutOrderPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("loading");
  const [cart, setCart] = useState<PosCartPayload | null>(null);
  const [username, setUsername] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("CASH");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderRef, setOrderRef] = useState("");

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Auth guard
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/auth?mode=login&returnUrl=/checkout-order");
      return;
    }

    setUsername(localStorage.getItem("username") || "Staff");

    // Load cart written by POS page
    const payload = loadPosCart();
    if (!payload || payload.items.length === 0) {
      setStep("empty");
      return;
    }

    setCart(payload);
    setStep("form");
  }, [router]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * handleConfirm – Gọi BE API tạo đơn hàng và đánh dấu hoàn thành.
   *
   * Flow:
   *   1. POST /orders  → tạo đơn (status PENDING)
   *   2. Lưu localStorage để trang Lịch sử đơn hàng hiển thị được
   *
   * NOTE: paymentMethod được hiển thị cho nhân viên nhưng chưa lưu được vào DB
   *   vì BE chưa có endpoint POST /payments.
   *   TODO: Thêm lối gọi payments API khi BE triển khai xong bảng payments.
   */
  const handleConfirm = async () => {
    if (!cart) return;
    setStep("processing");
    setErrorMsg("");

    try {
      // 1️⃣ Tạo đơn hàng (PENDING)
      const orderResponse = await createOrder({
        userId: cart.userId,
        customerId: 1, // HARDCODE: khách vãng lai, dùng tạm ID=1 cho đến khi có customer management
        shiftId: cart.shiftId, // HARDCODE: lấy từ POS header, lưu posCart
        totalAmount: cart.total,
        note: `[${cart.orderType}]`,
        order_items: cart.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
        })),
      });

      // TODO: Gọi POST /payments khi BE có endpoint:
      // await createPayment({ orderId: orderResponse.id, amount: cart.total, paymentMethod: selectedMethod, ... });

      clearPosCart();
      setOrderRef(String(orderResponse.id));
      setStep("success");
    } catch (err: unknown) {
      const msg = (err as any)?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      setErrorMsg(msg);
      setStep("error");
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === "empty") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-500 mb-6">
            Vui lòng thêm sản phẩm từ màn hình POS trước khi thanh toán.
          </p>
          <Link
            href="/pos"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại POS
          </Link>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xử lý đơn hàng...
          </h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4 pt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đơn hàng thành công!
          </h2>
          <p className="text-gray-500 mb-6">
            Cảm ơn <strong>{username}</strong>, đơn hàng đã được ghi nhận.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mã đơn</span>
              <span className="font-semibold text-gray-800">{orderRef}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Loại đơn</span>
              <span className="font-semibold text-gray-800">
                {cart?.orderType === "eat-in" ? "Ăn tại chỗ" : "Mang về"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phương thức</span>
              <span className="font-semibold text-gray-800">
                {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-blue-100 pt-2 mt-2">
              <span className="text-gray-500">Tổng tiền</span>
              <span className="font-bold text-blue-600 text-base">
                {formatPrice(cart?.total ?? 0)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/pos")}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Quay lại POS →
          </button>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-red-500 mb-6 text-sm">{errorMsg}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Thử lại
            </button>
            <Link
              href="/pos"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-center"
            >
              Quay lại POS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ─────────────────────────────────────────────────────────────
  // Mirrors the layout of /checkout but scoped to POS product orders.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back button */}
        <Link
          href="/pos"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-8 text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại POS
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Order Summary ────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                Đơn hàng POS
              </h3>

              {/* Order type badge */}
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    cart?.orderType === "eat-in"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {cart?.orderType === "eat-in"
                    ? "🍽 Ăn tại chỗ"
                    : "🥡 Mang về"}
                </span>
              </div>

              {/* Product list */}
              <ul className="space-y-3 mb-5">
                {cart?.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(cart?.total ?? 0)}
                </span>
              </div>

              {/* Staff info */}
              <div className="mt-5 text-xs text-gray-400 flex justify-between">
                <span>Nhân viên</span>
                <span className="font-medium text-gray-600">{username}</span>
              </div>

              {/* Security note */}
              <div className="mt-6 bg-green-50 rounded-xl p-4 flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">🔒</span>
                <p className="text-green-700 text-xs leading-relaxed">
                  Giao dịch được ghi nhận và lưu trữ an toàn.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Payment Form ────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Xác nhận thanh toán
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Chọn phương thức nhận tiền từ khách hàng
              </p>

              {/* Payment method selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">
                        {method.icon}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          selectedMethod === method.id
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {method.label}
                      </span>
                      {selectedMethod === method.id && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contextual instructions */}
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <span>💡</span> Hướng dẫn
                </h4>
                {selectedMethod === "CASH" && (
                  <p className="text-sm text-yellow-700">
                    Nhận tiền mặt từ khách và trao lại hóa đơn / biên lai.
                  </p>
                )}
                {selectedMethod === "BANK_TRANSFER" && (
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>
                      <strong>Ngân hàng:</strong> Vietcombank
                    </p>
                    <p>
                      <strong>Số tài khoản:</strong> 1234 5678 9012
                    </p>
                    <p>
                      <strong>Chủ TK:</strong> MANAGE APP CO., LTD
                    </p>
                  </div>
                )}
                {selectedMethod === "MOMO" && (
                  <p className="text-sm text-yellow-700">
                    Hướng dẫn khách quét mã QR MoMo tại quầy.
                  </p>
                )}
                {selectedMethod === "VNPAY" && (
                  <p className="text-sm text-yellow-700">
                    Hướng dẫn khách quét mã VNPay tại quầy hoặc thanh toán qua
                    app.
                  </p>
                )}
              </div>

              {/* Item count summary */}
              <div className="mb-6 text-sm text-gray-500">
                {cart?.items.length ?? 0} sản phẩm •{" "}
                {cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0} phần
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                Xác nhận thanh toán — {formatPrice(cart?.total ?? 0)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
