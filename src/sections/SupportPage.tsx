"use client";

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
      description: "0902673430 (8:00 - 22:00 hàng ngày)",
      action: "Gọi ngay",
      color: "blue",
    },
    {
      icon: "📧",
      title: "Email",
      description: "lumioviet@gmail.com",
      action: "Gửi email",
      color: "purple",
    },
    {
      icon: "📱",
      title: "Zalo",
      description: "Kết nối qua Zalo 0902673430",
      action: "Chat Zalo",
      color: "blue",
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            Gọi ngay: 0902673430
          </a>
        </div>
      </section>
    </div>
  );
}
