"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { decodeJwt, type UserJwtPayload } from "@/lib/jwt";

function getRedirectDestinationByRole(role: string): string {
  const normalized = (role || "").toUpperCase();
  if (normalized === "ADMIN") return "/admin";
  if (normalized === "SHOPOWNER" || normalized === "STAFF") return "/manager";
  return "/";
}

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  const token = useMemo(() => {
    return (
      searchParams?.get("token") ||
      searchParams?.get("accessToken") ||
      searchParams?.get("access_token") ||
      ""
    );
  }, [searchParams]);

  const returnUrl = useMemo(() => {
    const raw = searchParams?.get("returnUrl") || "";
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "";
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      const msg =
        searchParams?.get("message") ||
        searchParams?.get("error") ||
        "Không nhận được token từ đăng nhập Google.";
      setError(msg);
      return;
    }

    const payload = decodeJwt<UserJwtPayload & { shop_id?: number }>(token);
    const role = (payload?.role ?? "").toString().toUpperCase();

    localStorage.setItem("accessToken", token);
    if (payload?.id != null) localStorage.setItem("userId", String(payload.id));
    if (payload?.username) localStorage.setItem("username", payload.username);
    localStorage.setItem("role", role);
    if (payload?.shop_id != null) {
      localStorage.setItem("shopId", String(payload.shop_id));
    }

    const destination = returnUrl || getRedirectDestinationByRole(role);
    router.replace(destination);
  }, [router, searchParams, token, returnUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-slate-800">Đăng nhập Google thất bại</h1>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/auth?mode=login"
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Quay lại đăng nhập
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-4">Đang hoàn tất đăng nhập Google...</p>
          </>
        )}
      </div>
    </div>
  );
}

