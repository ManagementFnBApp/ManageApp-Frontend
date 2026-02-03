'use client'

import Link from 'next/link'

export default function ServicesPage() {
    const plans = [
        {
            name: "Miễn phí",
            price: "0đ",
            period: "mãi mãi",
            description: "Phù hợp cho cửa hàng nhỏ, mới bắt đầu",
            features: [
                "1 cửa hàng",
                "Tối đa 100 sản phẩm",
                "3 nhân viên",
                "Báo cáo cơ bản",
                "Hỗ trợ email"
            ],
            isPopular: false,
            color: "gray"
        },
        {
            name: "Cơ bản",
            price: "399.000đ",
            period: "/tháng",
            description: "Phù hợp cho cửa hàng vừa và nhỏ",
            features: [
                "3 cửa hàng",
                "Không giới hạn sản phẩm",
                "10 nhân viên",
                "Báo cáo chi tiết",
                "Hỗ trợ 24/7",
                "App mobile",
                "Quản lý công nợ"
            ],
            isPopular: false,
            color: "blue"
        },
        {
            name: "Chuyên nghiệp",
            price: "799.000đ",
            period: "/tháng",
            description: "Phù hợp cho doanh nghiệp đa chi nhánh",
            features: [
                "Không giới hạn cửa hàng",
                "Không giới hạn sản phẩm",
                "Không giới hạn nhân viên",
                "Báo cáo nâng cao",
                "Hỗ trợ ưu tiên 24/7",
                "App mobile",
                "Quản lý công nợ",
                "Tích hợp đa kênh",
                "API & Webhook",
                "Chuyên viên hỗ trợ riêng"
            ],
            isPopular: true,
            color: "blue"
        },
        {
            name: "Doanh nghiệp",
            price: "Liên hệ",
            period: "",
            description: "Giải pháp tùy chỉnh cho tập đoàn",
            features: [
                "Tất cả tính năng Pro",
                "Tùy chỉnh theo yêu cầu",
                "Đào tạo onsite",
                "Tích hợp hệ thống riêng",
                "SLA 99.9%",
                "Dedicated server",
                "Bảo mật nâng cao"
            ],
            isPopular: false,
            color: "purple"
        }
    ]

    const addons = [
        {
            name: "Website bán hàng",
            price: "299.000đ/tháng",
            description: "Website riêng với tên miền của bạn"
        },
        {
            name: "App mobile branded",
            price: "499.000đ/tháng",
            description: "App với logo và thương hiệu của bạn"
        },
        {
            name: "Tích hợp Shopee/Lazada",
            price: "199.000đ/tháng",
            description: "Đồng bộ đơn hàng và tồn kho tự động"
        },
        {
            name: "SMS Marketing",
            price: "Theo gói",
            description: "Gửi tin nhắn khuyến mãi cho khách hàng"
        }
    ]

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Bảng giá dịch vụ</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Lựa chọn gói dịch vụ phù hợp với quy mô doanh nghiệp của bạn
                    </p>
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
                        🎉 Giảm 20% khi thanh toán theo năm
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {plans.map((plan, index) => (
                            <div 
                                key={index} 
                                className={`relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all ${
                                    plan.isPopular ? 'border-4 border-blue-500 transform scale-105' : 'border border-gray-200'
                                }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-1 rounded-full text-sm font-semibold">
                                        Phổ biến nhất
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                                    <span className="text-gray-600">{plan.period}</span>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start text-sm">
                                            <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                                        plan.isPopular 
                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {plan.price === "Liên hệ" ? "Liên hệ tư vấn" : "Dùng thử miễn phí"}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Add-ons */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Dịch vụ bổ sung
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">
                        Mở rộng tính năng theo nhu cầu của bạn
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {addons.map((addon, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{addon.name}</h3>
                                <div className="text-2xl font-bold text-blue-600 mb-3">{addon.price}</div>
                                <p className="text-gray-600 text-sm">{addon.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        So sánh chi tiết
                    </h2>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-gray-900 font-semibold">Tính năng</th>
                                        <th className="px-6 py-4 text-center text-gray-900 font-semibold">Miễn phí</th>
                                        <th className="px-6 py-4 text-center text-gray-900 font-semibold">Cơ bản</th>
                                        <th className="px-6 py-4 text-center text-blue-600 font-semibold">Pro</th>
                                        <th className="px-6 py-4 text-center text-gray-900 font-semibold">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 text-gray-700">Số cửa hàng</td>
                                        <td className="px-6 py-4 text-center">1</td>
                                        <td className="px-6 py-4 text-center">3</td>
                                        <td className="px-6 py-4 text-center text-blue-600">∞</td>
                                        <td className="px-6 py-4 text-center text-blue-600">∞</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-6 py-4 text-gray-700">Số sản phẩm</td>
                                        <td className="px-6 py-4 text-center">100</td>
                                        <td className="px-6 py-4 text-center text-blue-600">∞</td>
                                        <td className="px-6 py-4 text-center text-blue-600">∞</td>
                                        <td className="px-6 py-4 text-center text-blue-600">∞</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-gray-700">Báo cáo nâng cao</td>
                                        <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                        <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                        <td className="px-6 py-4 text-center text-green-500">✓</td>
                                        <td className="px-6 py-4 text-center text-green-500">✓</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="px-6 py-4 text-gray-700">API & Webhook</td>
                                        <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                        <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                        <td className="px-6 py-4 text-center text-green-500">✓</td>
                                        <td className="px-6 py-4 text-center text-green-500">✓</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                        Câu hỏi thường gặp
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Tôi có thể dùng thử miễn phí không?</h3>
                            <p className="text-gray-600">Có, bạn có thể dùng thử miễn phí 14 ngày tất cả tính năng, không cần thẻ tín dụng.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Tôi có thể hủy bất cứ lúc nào?</h3>
                            <p className="text-gray-600">Có, bạn có thể hủy bất cứ lúc nào. Không có ràng buộc hợp đồng dài hạn.</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Có hỗ trợ chuyển dữ liệu từ phần mềm khác không?</h3>
                            <p className="text-gray-600">Có, đội ngũ kỹ thuật sẽ hỗ trợ bạn chuyển dữ liệu hoàn toàn miễn phí.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-blue-600 text-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Bắt đầu dùng thử miễn phí ngay hôm nay</h2>
                    <p className="text-xl mb-8 opacity-90">
                        14 ngày dùng thử - Không cần thẻ tín dụng - Hủy bất cứ lúc nào
                    </p>
                    <Link 
                        href="/register"
                        className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
                    >
                        Dùng thử miễn phí 14 ngày
                    </Link>
                </div>
            </section>
        </div>
    )
}


















