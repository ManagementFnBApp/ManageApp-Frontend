'use client'

import Link from 'next/link'

export default function SupportPage() {
    const supportChannels = [
        {
            icon: "📞",
            title: "Hotline hỗ trợ",
            description: "1900-xxxx (8:00 - 22:00 hàng ngày)",
            action: "Gọi ngay",
            color: "blue"
        },
        {
            icon: "💬",
            title: "Live Chat",
            description: "Trò chuyện trực tiếp với đội ngũ hỗ trợ",
            action: "Chat ngay",
            color: "green"
        },
        {
            icon: "📧",
            title: "Email",
            description: "support@manageapp.com",
            action: "Gửi email",
            color: "purple"
        },
        {
            icon: "📱",
            title: "Zalo",
            description: "Kết nối qua Zalo OA",
            action: "Chat Zalo",
            color: "blue"
        }
    ]

    const faqs = [
        {
            category: "Bắt đầu sử dụng",
            questions: [
                {
                    q: "Làm thế nào để tạo tài khoản?",
                    a: "Bạn click vào nút 'Đăng ký' ở góc trên bên phải, điền thông tin và xác nhận email là có thể bắt đầu sử dụng ngay."
                },
                {
                    q: "Tôi có thể nhập dữ liệu từ Excel không?",
                    a: "Có, bạn có thể nhập dữ liệu hàng loạt từ file Excel. Hệ thống hỗ trợ import sản phẩm, khách hàng, nhà cung cấp..."
                },
                {
                    q: "Cần bao lâu để thiết lập xong?",
                    a: "Thông thường chỉ mất 15-30 phút để thiết lập cơ bản. Đội ngũ hỗ trợ sẽ hướng dẫn bạn từng bước."
                }
            ]
        },
        {
            category: "Thanh toán & Gói dịch vụ",
            questions: [
                {
                    q: "Có gói dùng thử miễn phí không?",
                    a: "Có, bạn được dùng thử miễn phí 14 ngày với đầy đủ tính năng, không cần thẻ tín dụng."
                },
                {
                    q: "Các phương thức thanh toán nào được chấp nhận?",
                    a: "Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, thẻ ATM, Visa/Mastercard, ví điện tử..."
                },
                {
                    q: "Có được hoàn tiền không?",
                    a: "Nếu bạn không hài lòng trong 30 ngày đầu, chúng tôi hoàn lại 100% tiền."
                }
            ]
        },
        {
            category: "Bảo mật & Dữ liệu",
            questions: [
                {
                    q: "Dữ liệu của tôi có an toàn không?",
                    a: "Tất cả dữ liệu được mã hóa và lưu trữ trên cloud server với chuẩn bảo mật cao nhất. Backup tự động hàng ngày."
                },
                {
                    q: "Tôi có thể xuất dữ liệu ra không?",
                    a: "Có, bạn có thể xuất dữ liệu sang Excel/CSV bất cứ lúc nào. Dữ liệu luôn thuộc về bạn."
                },
                {
                    q: "Nếu hủy dịch vụ thì sao?",
                    a: "Bạn sẽ được cung cấp file backup đầy đủ dữ liệu trước khi tài khoản bị đóng."
                }
            ]
        }
    ]

    const guides = [
        {
            icon: "📚",
            title: "Hướng dẫn sử dụng",
            description: "Tài liệu chi tiết về các tính năng",
            link: "/guides"
        },
        {
            icon: "🎥",
            title: "Video tutorials",
            description: "Học qua video ngắn dễ hiểu",
            link: "/videos"
        },
        {
            icon: "💡",
            title: "Tips & Tricks",
            description: "Mẹo sử dụng hiệu quả",
            link: "/tips"
        },
        {
            icon: "🔄",
            title: "Cập nhật mới",
            description: "Tính năng và cải tiến mới nhất",
            link: "/updates"
        }
    ]

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Trung tâm hỗ trợ</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
                    </p>
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm câu hỏi hoặc vấn đề..."
                                className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700">
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Channels */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        Liên hệ với chúng tôi
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {supportChannels.map((channel, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-1">
                                <div className="text-5xl mb-4">{channel.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{channel.title}</h3>
                                <p className="text-gray-600 mb-4 text-sm">{channel.description}</p>
                                <button 
                                    className={`px-6 py-2 bg-${channel.color}-600 text-white rounded-lg font-semibold hover:bg-${channel.color}-700 transition-colors`}
                                    style={{ backgroundColor: '#3b82f6' }}
                                >
                                    {channel.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        Tài nguyên hỗ trợ
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {guides.map((guide, index) => (
                            <Link 
                                key={index} 
                                href={guide.link}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{guide.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600">
                                    {guide.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{guide.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Câu hỏi thường gặp
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">
                        Tìm câu trả lời nhanh cho các câu hỏi phổ biến
                    </p>
                    <div className="space-y-8">
                        {faqs.map((section, sIndex) => (
                            <div key={sIndex}>
                                <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                                    <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
                                    {section.category}
                                </h3>
                                <div className="space-y-4">
                                    {section.questions.map((item, qIndex) => (
                                        <details 
                                            key={qIndex} 
                                            className="bg-white rounded-xl shadow-lg p-6 group"
                                        >
                                            <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                                                <span>{item.q}</span>
                                                <span className="text-blue-600 text-2xl group-open:rotate-180 transition-transform">›</span>
                                            </summary>
                                            <p className="mt-4 text-gray-600 leading-relaxed">{item.a}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still Need Help */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Vẫn cần hỗ trợ thêm?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng giúp đỡ bạn
                    </p>
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
                    <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div>
                            <div className="text-3xl font-bold mb-2">24/7</div>
                            <div className="opacity-90">Hỗ trợ liên tục</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">&lt; 5 phút</div>
                            <div className="opacity-90">Thời gian phản hồi</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">98%</div>
                            <div className="opacity-90">Khách hài lòng</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}












