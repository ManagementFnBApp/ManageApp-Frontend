"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

  const isCancelled = !code || code === ""; // user tự hủy (không có code lỗi)
  const errorLabel = CANCEL_REASONS[code] || desc || "Thanh toán không thành công hoặc đã bị hủy.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {/* Icon thất bại */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isCancelled ? "Thanh toán bị hủy" : "Thanh toán thất bại"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isCancelled
            ? "Bạn đã hủy giao dịch. Shop chưa được kích hoạt."
            : errorLabel}
        </p>

        {orderCode && (
          <div className="bg-gray-50 rounded-xl px-5 py-3 mb-6 text-sm text-gray-500">
            Mã đơn hàng: <span className="font-mono font-semibold text-gray-800">{orderCode}</span>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <span>💡</span> Gợi ý
          </h4>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>Kiểm tra số dư tài khoản ngân hàng</li>
            <li>Thử lại với phương thức thanh toán khác</li>
            <li>Liên hệ hỗ trợ nếu bị trừ tiền nhưng không kích hoạt</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/services"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg text-center"
          >
            Thử lại — Chọn gói dịch vụ
          </Link>
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
