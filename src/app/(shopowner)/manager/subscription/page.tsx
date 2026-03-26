"use client";

import { useState, useEffect } from "react";
import {
  renewPayosSubscription,
} from "@/apis/subscription";
import { BASE_URL } from "@/global-configs";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";

const PAYOS_BASE_ORDER_CODE = 700000000;

function buildPayosCheckoutUrl(paymentId: number): string {
  return `https://pay.payos.vn/web/${PAYOS_BASE_ORDER_CODE + paymentId}`;
}

/**
 * Điều hướng qua backend callback với code CANCEL để force-fail payment cũ.
 * Backend sẽ mark payment thành 'failed' rồi redirect về /payment/failed.
 */
function forceFailAndRedirect(paymentId: number): void {
  const orderCode = PAYOS_BASE_ORDER_CODE + paymentId;
  window.location.href = `${BASE_URL}/subscriptions/payments/payos/callback?orderCode=${orderCode}&code=CANCEL&desc=order_not_found_on_payos`;
}

function extractPendingPaymentId(errorMsg: string): number | null {
  const match = errorMsg.match(/Payment ID[:\s]+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingPaymentId, setPendingPaymentId] = useState<number | null>(null);
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    // Không gọi API "thông tin gói" vì backend hiện không có route tương ứng.
    // Trang chỉ giữ chức năng gia hạn qua PayOS.
    setBootLoading(false);
  }, []);

  const handleRenew = async () => {
    setIsLoading(true);
    setError("");
    setPendingPaymentId(null);
    try {
      const result = await renewPayosSubscription();
      if (!result?.checkoutUrl) {
        throw new Error("Không nhận được link thanh toán từ PayOS.");
      }
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";

      const pid = extractPendingPaymentId(msg);
      if (pid) {
        setPendingPaymentId(pid);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gói dịch vụ</h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý và gia hạn subscription của cửa hàng
        </p>
      </div>

      {/* ── Thông tin gói hiện tại ── */}
      {bootLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
            <Loader2 size={16} className="animate-spin" />
            Đang tải thông tin...
          </div>
        </div>
      )}

      {/* ── Gia hạn ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {pendingPaymentId && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-4">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">
                  Bạn đang có thanh toán chưa hoàn tất
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Payment ID:{" "}
                  <span className="font-mono font-bold">{pendingPaymentId}</span>{" "}
                  — Hoàn tất hoặc hủy giao dịch này trước khi tạo mới.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 px-4 pb-4">
              {/* Nút 1: Tiếp tục thanh toán (nếu link còn hợp lệ) */}
              <a
                href={buildPayosCheckoutUrl(pendingPaymentId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all text-sm"
              >
                <ExternalLink size={15} />
                Tiếp tục thanh toán (Payment #{pendingPaymentId})
              </a>

              {/* Nút 2: Hủy payment cũ bị hết hạn & tạo mới */}
              <button
                type="button"
                onClick={() => forceFailAndRedirect(pendingPaymentId)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-red-50 border border-red-300 text-red-600 hover:text-red-700 rounded-lg font-semibold transition-all text-sm"
              >
                <Trash2 size={15} />
                Đơn hàng không tồn tại trên PayOS? Hủy &amp; tạo thanh toán mới
              </button>
            </div>

            {/* Gợi ý */}
            <div className="border-t border-amber-200 px-4 py-2.5 bg-amber-50/60">
              <p className="text-xs text-amber-600">
                💡 Nếu PayOS báo &ldquo;đơn hàng không tồn tại&rdquo;, nhấn nút
                đỏ để hủy thanh toán cũ và tạo lại từ đầu.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleRenew}
          disabled={isLoading || !!pendingPaymentId}
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

      {/* ── Lưu ý ── */}
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
