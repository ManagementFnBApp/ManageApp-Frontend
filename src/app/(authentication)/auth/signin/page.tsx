"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ROLE_CODE_ADMIN,
  ROLE_CODE_SHOP_OWNER,
  getStoredRoleNormalized,
} from "@/apis/auth";

export default function SigninPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");
    const role = getStoredRoleNormalized();

    if (token) {
      // Điều hướng về đúng trang "thường thấy" sau khi đăng nhập
      if (role === ROLE_CODE_ADMIN) {
        router.replace("/admin");
      } else if (role === ROLE_CODE_SHOP_OWNER || role === "STAFF") {
        router.replace("/manager");
      } else {
        router.replace("/");
      }
      return;
    }

    // Chưa đăng nhập -> hiển thị form đăng nhập
    router.replace("/auth?mode=login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

