"use client";

export default function CustomersPage() {
  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "CEO",
      company: "Cửa hàng thời trang ABC",
      avatar: "👨‍💼",
      content:
        "LumioViet giúp tôi quản lý 5 cửa hàng một cách dễ dàng. Doanh thu tăng 40% sau 6 tháng sử dụng.",
      rating: 5,
    },
    {
      name: "Trần Thị B",
      role: "Chủ nhà hàng",
      company: "Nhà hàng Hương Việt",
      avatar: "👩‍💼",
      content:
        "Hệ thống đặt bàn và order online rất tiện lợi. Khách hàng rất hài lòng với trải nghiệm.",
      rating: 5,
    },
    {
      name: "Lê Minh C",
      role: "Giám đốc",
      company: "Siêu thị mini XYZ",
      avatar: "👨",
      content:
        "Quản lý kho hàng chính xác, không còn thất thoát. Tiết kiệm được rất nhiều chi phí.",
      rating: 5,
    },
    {
      name: "Phạm Thu D",
      role: "Chủ spa",
      company: "Beauty Spa",
      avatar: "👩",
      content:
        "Đặt lịch tự động, nhắc lịch khách hàng rất chuyên nghiệp. Tỷ lệ quay lại tăng 60%.",
      rating: 5,
    },
  ];

  const logos = [
    { name: "Vinmart", icon: "🏪" },
    { name: "Circle K", icon: "🏬" },
    { name: "Highlands", icon: "☕" },
    { name: "The Coffee House", icon: "🍵" },
    { name: "Guardian", icon: "💊" },
    { name: "Pharmacity", icon: "⚕️" },
  ];

  return (
    <div className="pt-20">
      <section className="bg-linear-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Khách hàng tin tưởng
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Hơn 300.000+ doanh nghiệp đã lựa chọn LumioViet
        </p>
        <div className="flex justify-center gap-12">
          {[
            ["300K+", "Khách hàng"],
            ["98%", "Hài lòng"],
            ["24/7", "Hỗ trợ"],
          ].map(([n, l], i) => (
            <div key={i}>
              <div className="text-4xl font-bold text-blue-600">{n}</div>
              <div className="text-gray-600">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Đối tác tiêu biểu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {logos.map((l, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-2">{l.icon}</div>
                <div className="text-sm font-semibold text-gray-700">
                  {l.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Khách hàng nói gì về chúng tôi
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-3">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium mb-3">
                  {t.company}
                </div>
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Bạn muốn thành công như họ?</h2>
        <a
          href="/register"
          className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Dùng thử miễn phí
        </a>
      </section>
    </div>
  );
}
