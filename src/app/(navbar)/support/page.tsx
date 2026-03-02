import Link from "next/link";

const supportColorMap: { [key: string]: string } = {
  blue: "bg-blue-600 hover:bg-blue-700",
  green: "bg-emerald-600 hover:bg-emerald-700",
  red: "bg-red-600 hover:bg-red-700",
  purple: "bg-purple-600 hover:bg-purple-700",
};

export default function SupportPage() {
  const supportChannels = [
    {
      icon: "📞",
      title: "Hotline hỗ trợ",
      description: "1900-xxxx (8:00 - 22:00 hàng ngày)",
      action: "Gọi ngay",
      color: "blue",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Trò chuyện trực tiếp với đội ngũ hỗ trợ",
      action: "Chat ngay",
      color: "green",
    },
    {
      icon: "📧",
      title: "Email",
      description: "support@manageapp.com",
      action: "Gửi email",
      color: "purple",
    },
    {
      icon: "📱",
      title: "Zalo",
      description: "Kết nối qua Zalo OA",
      action: "Chat Zalo",
      color: "blue",
    },
  ];
  const guides = [
    {
      icon: "📚",
      title: "Hướng dẫn sử dụng",
      description: "Tài liệu chi tiết về các tính năng",
      link: "/guides",
    },
    {
      icon: "🎥",
      title: "Video tutorials",
      description: "Học qua video ngắn dễ hiểu",
      link: "/videos",
    },
    {
      icon: "💡",
      title: "Tips & Tricks",
      description: "Mẹo sử dụng hiệu quả",
      link: "/tips",
    },
    {
      icon: "🔄",
      title: "Cập nhật mới",
      description: "Tính năng và cải tiến mới nhất",
      link: "/updates",
    },
  ];
  const faqs = [
    {
      category: "Bắt đầu sử dụng",
      questions: [
        {
          q: "Làm thế nào để tạo tài khoản?",
          a: "Bạn click vào nút Đăng ký ở góc trên bên phải, điền thông tin và xác nhận email là có thể bắt đầu sử dụng ngay.",
        },
        {
          q: "Tôi có thể nhập dữ liệu từ Excel không?",
          a: "Có, bạn có thể nhập dữ liệu hàng loạt từ file Excel.",
        },
        {
          q: "Cần bao lâu để thiết lập xong?",
          a: "Thông thường chỉ mất 15-30 phút để thiết lập cơ bản.",
        },
      ],
    },
    {
      category: "Thanh toán & Gói dịch vụ",
      questions: [
        {
          q: "Có gói dùng thử miễn phí không?",
          a: "Có, bạn được dùng thử miễn phí 14 ngày với đầy đủ tính năng.",
        },
        {
          q: "Các phương thức thanh toán nào được chấp nhận?",
          a: "Chuyển khoản ngân hàng, thẻ ATM, Visa/Mastercard, ví điện tử...",
        },
        {
          q: "Có được hoàn tiền không?",
          a: "Nếu bạn không hài lòng trong 30 ngày đầu, chúng tôi hoàn lại 100% tiền.",
        },
      ],
    },
    {
      category: "Bảo mật & Dữ liệu",
      questions: [
        {
          q: "Dữ liệu của tôi có an toàn không?",
          a: "Tất cả dữ liệu được mã hóa và backup tự động hàng ngày.",
        },
        {
          q: "Tôi có thể xuất dữ liệu ra không?",
          a: "Có, bạn có thể xuất dữ liệu sang Excel/CSV bất cứ lúc nào.",
        },
      ],
    },
  ];
  return (
    <div className="pt-20">
      <section className="bg-linear-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Trung tâm hỗ trợ
        </h1>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Liên hệ với chúng tôi
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all"
              >
                <div className="text-5xl mb-4">{c.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {c.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">{c.description}</p>
                <button
                  className={`px-6 py-2 ${supportColorMap[c.color]} text-white rounded-lg font-semibold transition-colors`}
                >
                  {c.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Tài nguyên hỗ trợ
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((g, i) => (
              <Link
                key={i}
                href={g.link}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all group"
              >
                <div className="text-4xl mb-4">{g.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600">
                  {g.title}
                </h3>
                <p className="text-gray-600 text-sm">{g.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-8">
            {faqs.map((s, si) => (
              <div key={si}>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                  <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
                  {s.category}
                </h3>
                <div className="space-y-4">
                  {s.questions.map((item, qi) => (
                    <details
                      key={qi}
                      className="bg-white rounded-xl shadow-lg p-6 group"
                    >
                      <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                        <span>{item.q}</span>
                        <span className="text-blue-600 text-2xl">›</span>
                      </summary>
                      <p className="mt-4 text-gray-600 leading-relaxed">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Vẫn cần hỗ trợ thêm?</h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/contact"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Gửi yêu cầu hỗ trợ
          </Link>
          <a
            href="tel:1900xxxx"
            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Gọi ngay: 1900-xxxx
          </a>
        </div>
      </section>
    </div>
  );
}
