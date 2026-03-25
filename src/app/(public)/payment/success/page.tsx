"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LOGIN_URL = "/auth?mode=login&returnUrl=/manager";

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("shopId");
  localStorage.removeItem("username");
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams?.get("orderCode") || "";

  const [username, setUsername] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Lưu username trước khi xóa session
      const uname = localStorage.getItem("username") || "";
      setUsername(uname);
      // Xóa token cũ ngay lập tức — backend đã cấp role SHOPOWNER qua webhook,
      // user cần đăng nhập lại để nhận JWT mới có role đúng
      clearSession();
    }
  }, []);

  // Tự động redirect về trang login sau 5 giây
  useEffect(() => {
    if (countdown <= 0) {
      router.push(LOGIN_URL);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {/* Icon thành công */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounceIn_0.6s_ease-out]">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-500 mb-6">
          Chào mừng{username ? <>, <strong>{username}</strong></> : " bạn"}!<br />
          Shop của bạn đã được kích hoạt và nâng cấp lên{" "}
          <strong className="text-blue-600">Shop Owner</strong>.
        </p>

        {orderCode && (
          <div className="bg-gray-50 rounded-xl px-5 py-3 mb-6 text-sm text-gray-500">
            Mã đơn hàng: <span className="font-mono font-semibold text-gray-800">{orderCode}</span>
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-5 mb-6 text-left space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-lg shrink-0">✓</span>
            <p className="text-sm text-blue-700">Shop đã được kích hoạt và sẵn sàng hoạt động</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-lg shrink-0">✓</span>
            <p className="text-sm text-blue-700">Tài khoản đã được cấp quyền Shop Owner</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-lg shrink-0">✓</span>
            <p className="text-sm text-blue-700">Bạn có thể quản lý menu, nhân viên, đơn hàng ngay bây giờ</p>
          </div>
        </div>

        {/* Thông báo cần đăng nhập lại */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-left">
          <p className="text-sm text-amber-800 font-medium mb-1">Cần đăng nhập lại</p>
          <p className="text-xs text-amber-700">
            Để sử dụng đầy đủ quyền Shop Owner, hệ thống sẽ tự động đăng xuất và
            chuyển bạn đến trang đăng nhập để lấy token mới.
          </p>
        </div>

        <button
          onClick={() => router.push(LOGIN_URL)}
          className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg text-center mb-3"
        >
          Đăng nhập lại → Vào trang Quản lý
        </button>

        <p className="text-sm text-gray-400">
          Tự động chuyển hướng sau{" "}
          <span className="font-semibold text-gray-600">{countdown}</span> giây...
        </p>
      </div>

      <style jsx global>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
