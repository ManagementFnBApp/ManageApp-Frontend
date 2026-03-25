"use client";

import { useState } from "react";
import { renewPayosSubscription } from "@/apis/subscription";
import { CreditCard, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRenew = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await renewPayosSubscription();
      if (!result?.checkoutUrl) {
        throw new Error("Không nhận được link thanh toán từ PayOS.");
      }
      // Redirect sang cổng thanh toán PayOS
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Gói dịch vụ</h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý và gia hạn subscription của cửa hàng
        </p>
      </div>

      {/* Renewal card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Gia hạn subscription</h3>
            <p className="text-sm text-slate-500">
              Gia hạn gói dịch vụ hiện tại qua cổng thanh toán PayOS
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              Thanh toán an toàn qua cổng PayOS — hỗ trợ QR Banking tất cả ngân hàng
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              Shop được gia hạn ngay sau khi thanh toán thành công
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              Số lần gia hạn và ngày hết hạn mới được cập nhật tự động
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleRenew}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang tạo link thanh toán...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Gia hạn qua PayOS
            </>
          )}
        </button>
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={15} className="text-amber-600 shrink-0" />
          <h4 className="font-semibold text-amber-800 text-sm">Lưu ý</h4>
        </div>
        <ul className="text-sm text-amber-700 space-y-1.5 list-disc list-inside ml-1">
          <li>
            Sau khi nhấn &quot;Gia hạn qua PayOS&quot;, bạn sẽ được chuyển đến
            trang thanh toán PayOS
          </li>
          <li>Quét mã QR bằng ứng dụng ngân hàng để hoàn tất thanh toán</li>
          <li>
            Hệ thống sẽ tự động gia hạn subscription sau khi thanh toán thành
            công
          </li>
          <li>
            Liên hệ hỗ trợ nếu bị trừ tiền nhưng subscription chưa được gia hạn
          </li>
        </ul>
      </div>
    </div>
  );
}
