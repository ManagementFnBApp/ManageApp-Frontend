'use client'

export default function CustomersPage() {
    const testimonials = [
        {
            name: "Nguyễn Văn A",
            role: "CEO",
            company: "Cửa hàng thời trang ABC",
            avatar: "👨‍💼",
            content: "ManageApp giúp tôi quản lý 5 cửa hàng một cách dễ dàng. Doanh thu tăng 40% sau 6 tháng sử dụng.",
            rating: 5
        },
        {
            name: "Trần Thị B",
            role: "Chủ nhà hàng",
            company: "Nhà hàng Hương Việt",
            avatar: "👩‍💼",
            content: "Hệ thống đặt bàn và order online rất tiện lợi. Khách hàng rất hài lòng với trải nghiệm.",
            rating: 5
        },
        {
            name: "Lê Minh C",
            role: "Giám đốc",
            company: "Siêu thị mini XYZ",
            avatar: "👨",
            content: "Quản lý kho hàng chính xác, không còn thất thoát. Tiết kiệm được rất nhiều chi phí.",
            rating: 5
        },
        {
            name: "Phạm Thu D",
            role: "Chủ spa",
            company: "Beauty Spa",
            avatar: "👩",
            content: "Đặt lịch tự động, nhắc lịch khách hàng rất chuyên nghiệp. Tỷ lệ quay lại tăng 60%.",
            rating: 5
        }
    ]

    const logos = [
        { name: "Vinmart", icon: "🏪" },
        { name: "Circle K", icon: "🏬" },
        { name: "Highlands", icon: "☕" },
        { name: "The Coffee House", icon: "🍵" },
        { name: "Guardian", icon: "💊" },
        { name: "Pharmacity", icon: "⚕️" }
    ]

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Khách hàng tin tưởng</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Hơn 300.000+ doanh nghiệp đã lựa chọn ManageApp để phát triển kinh doanh
                    </p>
                    <div className="flex justify-center gap-12 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600">300K+</div>
                            <div className="text-gray-600">Khách hàng</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600">98%</div>
                            <div className="text-gray-600">Hài lòng</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600">24/7</div>
                            <div className="text-gray-600">Hỗ trợ</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner Logos */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                        Đối tác tiêu biểu
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {logos.map((logo, index) => (
                            <div key={index} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
                                <div className="text-5xl mb-2">{logo.icon}</div>
                                <div className="text-sm font-semibold text-gray-700">{logo.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Khách hàng nói gì về chúng tôi
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">
                        Câu chuyện thành công từ khách hàng thực tế
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-3">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 font-medium mb-3">{testimonial.company}</div>
                                <div className="flex mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400">⭐</span>
                                    ))}
                                </div>
                                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        Câu chuyện thành công
                    </h2>
                    <div className="space-y-12 max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Chuỗi cửa hàng thời trang tăng trưởng 300%</h3>
                            <p className="text-gray-600 mb-4">
                                <strong>Thử thách:</strong> Quản lý 10 cửa hàng với hàng nghìn sản phẩm, nhiều size và màu sắc.
                            </p>
                            <p className="text-gray-600 mb-4">
                                <strong>Giải pháp:</strong> Sử dụng ManageApp để đồng bộ kho hàng, quản lý đa kênh bán hàng.
                            </p>
                            <p className="text-gray-600">
                                <strong>Kết quả:</strong> Doanh thu tăng 300% sau 1 năm, mở thêm 5 cửa hàng mới.
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Nhà hàng tăng 40% khách đặt bàn online</h3>
                            <p className="text-gray-600 mb-4">
                                <strong>Thử thách:</strong> Khách hàng khó đặt bàn, order thủ công dễ nhầm lẫn.
                            </p>
                            <p className="text-gray-600 mb-4">
                                <strong>Giải pháp:</strong> Triển khai hệ thống đặt bàn online và order tự động.
                            </p>
                            <p className="text-gray-600">
                                <strong>Kết quả:</strong> Tăng 40% khách đặt bàn, giảm 80% sai sót trong order.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-blue-600 text-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Bạn muốn thành công như họ?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Tham gia cùng 300.000+ doanh nghiệp đang sử dụng ManageApp
                    </p>
                    <a 
                        href="/register"
                        className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Dùng thử miễn phí
                    </a>
                </div>
            </section>
        </div>
    )
}


















