"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [isAdminDashboard, setIsAdminDashboard] = useState(false);

  useEffect(() => {
    setIsAdminDashboard(pathname.startsWith("/admin"));
  }, [pathname]);

  if (isAdminDashboard) return null;

  return (
    <footer
      className="bg-blue-100 text-white"
      style={{ backgroundColor: "#93c5fd" }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">MA</span>
              </div>
              <span className="text-xl font-bold text-white">Manage App</span>
            </div>
            <p className="text-sm text-white">
              Hệ thống quản lý ứng dụng chuyên nghiệp, giúp doanh nghiệp phát
              triển bền vững.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-blue-600 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-white hover:text-blue-600 transition-colors"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-blue-600 transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-blue-600 transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-white">
              <li className="flex items-start space-x-2">
                <span>📧</span>
                <span>lumioviet@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>📞</span>
                <span>0902673430</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>📍</span>
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white border-opacity-30 mt-8 pt-8 text-center text-sm text-white">
          <p>&copy; {currentYear} Manage App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
