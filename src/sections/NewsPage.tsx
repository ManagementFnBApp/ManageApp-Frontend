export default function NewsPage() {
  const featured = {
    title: "LumioViet ra mắt tính năng AI dự đoán xu hướng bán hàng",
    excerpt:
      "Công nghệ AI mới giúp doanh nghiệp dự đoán chính xác nhu cầu khách hàng",
    date: "27/01/2026",
    category: "Sản phẩm",
    image: "🤖",
    readTime: "5 phút đọc",
  };
  const news = [
    {
      title: "LumioViet đạt 300.000 khách hàng trên toàn quốc",
      excerpt: "Chúng tôi tự hào thông báo đã phục vụ hơn 300.000 doanh nghiệp",
      date: "25/01/2026",
      category: "Công ty",
      image: "🎉",
    },
    {
      title: "Tích hợp thanh toán QR Code với 15 ngân hàng lớn",
      excerpt: "Khách hàng giờ có thể thanh toán nhanh chóng qua QR Code",
      date: "20/01/2026",
      category: "Tính năng",
      image: "📱",
    },
    {
      title: "Hợp tác với Shopee và Lazada để đồng bộ đơn hàng",
      excerpt: "Tích hợp sâu với các sàn TMĐT giúp quản lý đơn hàng đa kênh",
      date: "15/01/2026",
      category: "Đối tác",
      image: "🤝",
    },
    {
      title: "10 tips quản lý kho hàng hiệu quả cho cửa hàng nhỏ",
      excerpt: "Chia sẻ kinh nghiệm từ các chuyên gia về cách quản lý tồn kho",
      date: "12/01/2026",
      category: "Hướng dẫn",
      image: "📦",
    },
    {
      title: "LumioViet Mobile App đạt 4.8⭐ trên cả iOS và Android",
      excerpt:
        "Ứng dụng di động nhận được đánh giá cao từ cộng đồng người dùng",
      date: "08/01/2026",
      category: "Sản phẩm",
      image: "📱",
    },
    {
      title: "Webinar: Chuyển đổi số cho doanh nghiệp nhỏ",
      excerpt: "Tham gia webinar miễn phí về xu hướng chuyển đổi số năm 2026",
      date: "05/01/2026",
      category: "Sự kiện",
      image: "🎓",
    },
  ];
  const categories = [
    "Tất cả",
    "Sản phẩm",
    "Tính năng",
    "Công ty",
    "Hướng dẫn",
    "Sự kiện",
    "Đối tác",
  ];
  return (
    <div className="pt-20">
      <section className="bg-linear-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Tin tức & Cập nhật
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Cập nhật mới nhất về sản phẩm, tính năng và xu hướng ngành
        </p>
      </section>
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 md:p-12 text-white flex flex-col justify-center">
                <div className="inline-block px-4 py-1 bg-white text-blue-600 bg-opacity-20 rounded-full text-sm font-semibold mb-4 w-fit">
                  {featured.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {featured.title}
                </h2>
                <p className="text-lg mb-6 opacity-90">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm opacity-80 mb-6">
                  <span>📅 {featured.date}</span>
                  <span>⏱️ {featured.readTime}</span>
                </div>
                <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">
                  Đọc thêm →
                </button>
              </div>
              <div className="flex items-center justify-center p-12 text-9xl">
                {featured.image}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Tin tức mới nhất
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((a, i) => (
              <article
                key={i}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="h-48 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center text-7xl">
                  {a.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      {a.category}
                    </span>
                    <span className="text-xs text-gray-500">{a.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {a.excerpt}
                  </p>
                  <button className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                    Đọc thêm →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-gray-900 text-white py-20 px-4 text-center">
        <div className="text-5xl mb-6">📬</div>
        <h2 className="text-4xl font-bold mb-4">Đăng ký nhận tin tức</h2>
        <div className="flex gap-3 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            className="flex-1 px-6 py-3 rounded-lg bg-white text-gray-900 focus:outline-none"
          />
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">
            Đăng ký
          </button>
        </div>
      </section>
    </div>
  );
}
