"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createSubscriptionTenant,
  createSubscriptionPayment,
  confirmPayment,
  createPayosPayment,
} from "@/apis/subscription";
import { updateLocalRole, ROLE_CODE_SHOP_OWNER } from "@/apis/auth";
import Link from "next/link";

const PAYMENT_METHODS = [
  { id: "PAYOS", label: "PayOS (QR Banking)", icon: "🏧" },
  { id: "CASH", label: "Tiền mặt", icon: "💵" },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subscriptionId = Number(searchParams?.get("subscriptionId"));
  const packageCode = searchParams?.get("packageCode") || "";
  const price = Number(searchParams?.get("price") || 0);
  const billing = searchParams?.get("billing") || "MONTHLY";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("PAYOS");
  const [step, setStep] = useState<"form" | "processing" | "success" | "error">(
    "form",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopNameTouched, setShopNameTouched] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const uname = localStorage.getItem("username") || "";
      setIsLoggedIn(!!token);
      setUsername(uname);
      if (!token) {
        router.replace(
          `/auth?mode=login&returnUrl=/checkout?subscriptionId=${subscriptionId}&packageCode=${packageCode}&price=${price}&billing=${billing}`,
        );
      }
    }
  }, [router, subscriptionId, packageCode, price, billing]);

  if (!subscriptionId || !packageCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Thông tin gói không hợp lệ
          </h2>
          <p className="text-gray-500 mb-6">
            Vui lòng chọn lại gói từ trang dịch vụ.
          </p>
          <Link
            href="/services"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Xem các gói dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  const billingLabel =
    billing === "YEARLY" ? "/năm" : billing === "MONTHLY" ? "/tháng" : "";

  const handleSubmit = async () => {
    const name = shopName.trim();
    if (!name) {
      setShopNameTouched(true);
      setErrorMsg("Vui lòng nhập tên cửa hàng.");
      return;
    }
    setStep("processing");
    setErrorMsg("");
    try {
      // Bước 1: Tạo shop + shop subscription (POST /subscriptions/shops)
      const shopSub = await createSubscriptionTenant(subscriptionId, name);

      if (selectedMethod === "PAYOS") {
        // Luồng PayOS: tạo link thanh toán rồi redirect sang PayOS
        const payosResult = await createPayosPayment(shopSub.sub_shop_id);
        if (!payosResult?.checkoutUrl) {
          throw new Error("Không nhận được link thanh toán từ PayOS.");
        }
        // Redirect toàn trang sang cổng thanh toán PayOS
        window.location.href = payosResult.checkoutUrl;
        return;
      }

      // Luồng thủ công: tạo payment pending → confirm ngay
      const payment = await createSubscriptionPayment(
        shopSub.sub_shop_id,
        selectedMethod,
        price,
      );

      await confirmPayment(payment.sub_payment_id);

      updateLocalRole(ROLE_CODE_SHOP_OWNER);
      setShopName(
        payment.shop?.shop_name ||
          name ||
          shopSub.subscription?.package_code ||
          `${username}'s Shop`,
      );
      setStep("success");
    } catch (err: any) {
      console.error("Checkout error:", err);

      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setErrorMsg(
        apiMessage || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.",
      );
      setStep("error");
    }
  };

  // === SUCCESS STATE ===
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white px-4 pt-20">
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
            Thanh toán thành công!
          </h2>
          <p className="text-gray-500 mb-6">
            Chào mừng bạn, <strong>{username}</strong>!<br />
            Tài khoản đã được nâng cấp lên{" "}
            <strong className="text-blue-600">Shop Owner</strong>.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gói dịch vụ</span>
              <span className="font-semibold text-gray-800">{packageCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tên cửa hàng</span>
              <span className="font-semibold text-gray-800">{shopName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phương thức</span>
              <span className="font-semibold text-gray-800">
                {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-blue-100 pt-2 mt-2">
              <span className="text-gray-500">Số tiền</span>
              <span className="font-bold text-blue-600 text-base">
                {price.toLocaleString("vi-VN")}đ{billingLabel}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              // Xóa token cũ trước để auth guard không redirect ra ngoài
              localStorage.removeItem("accessToken");
              localStorage.removeItem("userId");
              localStorage.removeItem("username");
              localStorage.removeItem("role");
              localStorage.removeItem("shopId");
              // Sau đó mới navigate → login để lấy token mới có role SHOPOWNER
              router.push("/auth?mode=login&returnUrl=/manager");
            }}
            className="block w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg text-center"
          >
            Đăng nhập lại → Vào trang Quản Lý Cửa Hàng
          </button>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
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
              href="/services"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-center"
            >
              Chọn gói khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === PROCESSING STATE ===
  if (step === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // === FORM STATE ===
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 py-28 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back button */}
        <Link
          href="/services"
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
          Quay lại xem gói
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-28">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 text-sm">Gói dịch vụ</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">
                    {packageCode}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 text-sm">Chu kỳ</span>
                  <span className="font-medium text-gray-700">
                    {billing === "YEARLY"
                      ? "Hàng năm"
                      : billing === "MONTHLY"
                        ? "Hàng tháng"
                        : "Một lần"}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 text-sm">Tài khoản</span>
                  <span className="font-medium text-blue-600">{username}</span>
                </div>
                <div>
                  <label
                    htmlFor="checkout-shop-name"
                    className="text-gray-500 text-sm block mb-1"
                  >
                    Tên cửa hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-shop-name"
                    type="text"
                    value={shopName}
                    onChange={(e) => {
                      setShopName(e.target.value);
                      setShopNameTouched(false);
                      setErrorMsg("");
                    }}
                    onBlur={() => setShopNameTouched(true)}
                    placeholder="VD: Cà phê Sài Gòn, Bánh mì 37..."
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      shopNameTouched && !shopName.trim()
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                  />
                  {shopNameTouched && !shopName.trim() && (
                    <p className="text-red-500 text-xs mt-1">
                      Vui lòng nhập tên cửa hàng trước khi thanh toán.
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {price.toLocaleString("vi-VN")}đ
                    <span className="text-sm font-normal text-gray-500">
                      {billingLabel}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-green-50 rounded-xl p-4 flex items-start gap-3">
                <span className="text-green-600 text-xl shrink-0">🔒</span>
                <p className="text-green-700 text-xs leading-relaxed">
                  Thanh toán an toàn & bảo mật. Tài khoản được kích hoạt ngay
                  sau khi thanh toán thành công.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Chọn phương thức thanh toán phù hợp với bạn
              </p>

              {/* Payment Methods */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{method.icon}</span>
                      <span
                        className={`text-sm font-medium ${selectedMethod === method.id ? "text-blue-700" : "text-gray-700"}`}
                      >
                        {method.label}
                      </span>
                      {selectedMethod === method.id && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
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

              {/* Payment Instructions */}
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <span>💡</span> Hướng dẫn thanh toán
                </h4>
                {selectedMethod === "PAYOS" && (
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>Bạn sẽ được chuyển đến trang thanh toán <strong>PayOS</strong> sau khi nhấn xác nhận.</p>
                    <p>Quét mã QR bằng ứng dụng ngân hàng bất kỳ để thanh toán nhanh chóng.</p>
                    <p className="text-green-700 font-medium">✓ Shop được kích hoạt ngay sau khi thanh toán thành công.</p>
                  </div>
                )}
                {selectedMethod === "CASH" && (
                  <p className="text-sm text-yellow-700">
                    Vui lòng đến văn phòng LumioViet để thanh toán tiền mặt. Địa
                    chỉ: 123 Nguyễn Văn Linh, Đà Nẵng.
                  </p>
                )}
              </div>

              {/* Agreement */}
              <p className="text-xs text-gray-400 mb-6">
                Bằng cách nhấn &quot;Xác nhận thanh toán&quot;, bạn đồng ý với{" "}
                <Link href="/support" className="text-blue-500 hover:underline">
                  điều khoản dịch vụ
                </Link>{" "}
                của LumioViet.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                {selectedMethod === "PAYOS"
                  ? `Thanh toán qua PayOS — ${price.toLocaleString("vi-VN")}đ`
                  : `Xác nhận thanh toán tiền mặt — ${price.toLocaleString("vi-VN")}đ`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
