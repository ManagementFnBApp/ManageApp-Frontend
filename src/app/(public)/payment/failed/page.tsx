"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PAYOS_BASE_ORDER_CODE = 700000000;

function isRenewPayment(orderCode: string): boolean {
  const code = Number(orderCode);
  if (!code) return false;
  const paymentId = code - PAYOS_BASE_ORDER_CODE;
  return paymentId > 0;
}

const CANCEL_REASONS: Record<string, string> = {
  "01": "Giao dịch không tồn tại",
  "02": "Giao dịch đã được thanh toán",
  "03": "Giao dịch đã bị hủy",
  "04": "Số tiền không hợp lệ",
  "05": "Tài khoản không đủ số dư",
  "99": "Lỗi không xác định",
};

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams?.get("orderCode") || "";
  const code = searchParams?.get("code") || "";
  const desc = searchParams?.get("desc") || "";

  // Đến từ force-fail (user hủy vì đơn hàng không tồn tại trên PayOS)
  const isOrderNotFound = desc === "order_not_found_on_payos";
  const isCancelled = !code || code === "" || isOrderNotFound;
  const isRenew = isRenewPayment(orderCode);

  const errorLabel = isOrderNotFound
    ? "Đơn hàng đã hết hạn hoặc không tồn tại trên PayOS."
    : CANCEL_REASONS[code] || desc || "Thanh toán không thành công hoặc đã bị hủy.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isOrderNotFound ? "Đơn hàng đã bị hủy" : isCancelled ? "Thanh toán bị hủy" : "Thanh toán thất bại"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isCancelled
            ? isOrderNotFound
              ? "Thanh toán cũ đã được xóa. Bạn có thể tạo thanh toán mới."
              : "Bạn đã hủy giao dịch. Shop chưa được kích hoạt."
            : errorLabel}
        </p>

        {orderCode && !isOrderNotFound && (
          <div className="bg-gray-50 rounded-xl px-5 py-3 mb-6 text-sm text-gray-500">
            Mã đơn hàng: <span className="font-mono font-semibold text-gray-800">{orderCode}</span>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <span>💡</span> {isOrderNotFound ? "Bước tiếp theo" : "Gợi ý"}
          </h4>
          {isOrderNotFound ? (
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Thanh toán cũ đã được hủy thành công</li>
              <li>Nhấn &ldquo;Gia hạn ngay&rdquo; để tạo thanh toán mới</li>
              <li>Liên hệ hỗ trợ nếu vẫn gặp sự cố</li>
            </ul>
          ) : (
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Kiểm tra số dư tài khoản ngân hàng</li>
              <li>Thử lại với phương thức thanh toán khác</li>
              <li>Liên hệ hỗ trợ nếu bị trừ tiền nhưng không kích hoạt</li>
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {isRenew ? (
            <Link
              href="/manager/subscription"
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg text-center ${
                isOrderNotFound
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {isOrderNotFound ? "Gia hạn ngay" : "Quay lại trang gia hạn"}
            </Link>
          ) : (
            <Link
              href="/services"
              className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-center"
            >
              Chọn gói dịch vụ khác
            </Link>
          )}

          <Link
            href="/support"
            className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition text-center"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
