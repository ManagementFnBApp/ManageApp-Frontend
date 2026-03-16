"use client";

import Link from "next/link";

export default function SolutionsPage() {
  const solutions = [
    {
      icon: "🏪",
      color: "bg-blue-100",
      title: "Bán lẻ",
      desc: "Giải pháp quản lý cửa hàng, kho hàng, nhân viên và khách hàng.",
      items: ["Quản lý tồn kho", "POS bán hàng", "Quản lý nhân viên"],
    },
    {
      icon: "🍽️",
      color: "bg-orange-100",
      title: "Nhà hàng - F&B",
      desc: "Quản lý nhà hàng, cafe với hệ thống order, bếp và thanh toán thông minh.",
      items: ["Quản lý bàn", "Order online", "Kết nối bếp"],
    },
    {
      icon: "👗",
      color: "bg-purple-100",
      title: "Thời trang",
      desc: "Quản lý size, màu sắc, mùa vụ và đa kênh bán hàng.",
      items: ["Quản lý thuộc tính", "Đa kênh bán", "CRM khách hàng"],
    },
    {
      icon: "💆",
      color: "bg-pink-100",
      title: "Spa - Salon",
      desc: "Đặt lịch, quản lý dịch vụ, liệu trình và chăm sóc khách hàng.",
      items: ["Đặt lịch online", "Quản lý liệu trình", "Chăm sóc khách"],
    },
    {
      icon: "💊",
      color: "bg-green-100",
      title: "Nhà thuốc",
      desc: "Quản lý thuốc, hạn dùng, công thức và tuân thủ quy định ngành dược.",
      items: ["Quản lý hạn dùng", "Công thức bào chế", "Báo cáo cơ quan"],
    },
  ];

  return (
    <div className="pt-20">
      <section className="bg-linear-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Giải pháp toàn diện
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          LumioViet cung cấp giải pháp quản lý bán hàng toàn diện cho mọi quy mô
          doanh nghiệp
        </p>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all"
              >
                <div
                  className={`w-16 h-16 ${s.color} rounded-full flex items-center justify-center mb-6`}
                >
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {s.title}
                </h3>
                <p className="text-gray-600 mb-6">{s.desc}</p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Tìm hiểu thêm →
                </Link>
              </div>
            ))}

            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Và nhiều ngành hàng khác
              </h3>
              <p className="mb-6 opacity-90">
                Siêu thị, mỹ phẩm, điện máy, xe máy...
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-900 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Đăng ký ngay
        </Link>
      </section>
    </div>
  );
}
