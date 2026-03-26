"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getProducts, getProductImageUrl, type Product } from "../apis/productApi";

export default function ProductsHomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const features = [
    {
      id: 0,
      title: "Quản lý kho",
      icon: "📦",
      description:
        "Theo dõi tồn kho và cảnh báo thiếu hàng theo thời gian thực",
      details: [
        "Theo dõi số lượng theo thời gian thực",
        "Tự động cảnh báo khi hàng tồn kho thấp",
        "Quản lý nhập – xuất kho dễ dàng",
        "Báo cáo tồn kho theo ngày / tuần / tháng",
        "Tích hợp nhà cung cấp để đặt hàng nhanh",
      ],
    },
    {
      id: 1,
      title: "Quản lý doanh thu",
      icon: "💰",
      description: "Theo dõi doanh thu và phân tích hiệu quả kinh doanh",
      details: [
        "Dashboard doanh thu theo thời gian thực",
        "Phân tích theo sản phẩm, nhân viên",
        "So sánh doanh thu các kỳ",
        "Báo cáo lợi nhuận chi tiết",
        "Xuất báo cáo Excel / PDF",
      ],
    },
    {
      id: 2,
      title: "Quản lý Menu",
      icon: "📋",
      description: "Quản lý menu linh hoạt, cập nhật nhanh chóng",
      details: [
        "Quản lý menu theo danh mục",
        "Cập nhật giá & mô tả dễ dàng",
        "Ẩn / hiện món theo thời gian",
        "Đánh dấu món hết hàng",
        "Tạo menu QR cho khách",
      ],
    },
    {
      id: 3,
      title: "Tạo Order",
      icon: "🛒",
      description: "Nhận order nhanh chóng, chính xác",
      details: [
        "Giao diện order dễ dùng",
        "Order theo bàn / mang đi",
        "In & gửi hóa đơn tự động",
        "Theo dõi trạng thái order",
        "Giảm sai sót cho nhân viên",
      ],
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const data = await getProducts();
        setProducts(data);
      } catch (err: unknown) {
        setProductsError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách sản phẩm",
        );
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + " đ";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
            ☕ Phần mềm quản lý F&B
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hệ thống quản lý toàn diện cho quán cà phê
          </h1>
        </div>
      </section>

      {/* ===== FEATURE SECTION ===== */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <aside className="w-64 shrink-0 sticky top-24 h-fit">
              <div className="bg-white border border-gray-200 rounded-xl p-2">
                {features.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFeature(f.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition ${
                      activeFeature === f.id
                        ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg">{f.icon}</span>
                    {f.title}
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex-1">
              {features.map((f) => (
                <div
                  key={f.id}
                  className={activeFeature === f.id ? "block" : "hidden"}
                >
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                          {f.icon}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            {f.title}
                          </h2>
                          <p className="text-gray-600 mt-1">{f.description}</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {f.details.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200"
                          >
                            <span className="text-blue-600 font-bold mt-1">
                              ✓
                            </span>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {d}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                      {f.id === 3 ? (
                        <div className="rounded-xl overflow-hidden">
                          <Image
                            src="/image/pos systems.png"
                            alt="POS"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl h-72 flex flex-col items-center justify-center text-center">
                          <div className="text-5xl mb-4">{f.icon}</div>
                          <p className="font-semibold text-gray-700">
                            Giao diện {f.title}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT SECTION ===== */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Danh sách sản phẩm
          </h2>

          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : productsError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">
              Chưa có sản phẩm nào.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.productId}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image
                      src={
                        getProductImageUrl(p.image) ||
                        "/image/product-placeholder.png"
                      }
                      alt={p.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {p.productName}
                      </h3>
                      <span className="px-2 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 shrink-0 self-start">
                        {formatCurrency(p.listPrice)}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-sm text-gray-600">{p.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
