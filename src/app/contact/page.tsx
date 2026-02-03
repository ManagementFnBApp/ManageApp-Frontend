'use client'

import { useState } from 'react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24h.')
    }

    const offices = [
        {
            city: "Hà Nội",
            address: "Tầng 10, Tòa nhà ABC, 123 Đường XYZ, Quận Hoàn Kiếm",
            phone: "(024) 1234 5678",
            email: "hanoi@manageapp.com",
            icon: "🏢"
        },
        {
            city: "Hồ Chí Minh",
            address: "Tầng 15, Tòa nhà DEF, 456 Đường UVW, Quận 1",
            phone: "(028) 8765 4321",
            email: "hcm@manageapp.com",
            icon: "🏙️"
        },
        {
            city: "Đà Nẵng",
            address: "Tầng 5, Tòa nhà GHI, 789 Đường RST, Quận Hải Châu",
            phone: "(0236) 3456 789",
            email: "danang@manageapp.com",
            icon: "🌊"
        }
    ]

    const contactMethods = [
        {
            icon: "📞",
            title: "Hotline",
            value: "1900-xxxx",
            description: "8:00 - 22:00 hàng ngày",
            color: "blue"
        },
        {
            icon: "📧",
            title: "Email",
            value: "support@manageapp.com",
            description: "Phản hồi trong 2h",
            color: "green"
        },
        {
            icon: "💬",
            title: "Live Chat",
            value: "Chat trực tiếp",
            description: "Online 24/7",
            color: "purple"
        },
        {
            icon: "📱",
            title: "Zalo",
            value: "Zalo OA",
            description: "Kết nối nhanh chóng",
            color: "blue"
        }
    ]

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">Liên hệ với chúng tôi</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {contactMethods.map((method, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all transform hover:-translate-y-1"
                            >
                                <div className="text-5xl mb-4">{method.icon}</div>
                                <h3 className="text-lg font-bold mb-2 text-gray-900">{method.title}</h3>
                                <div className="text-blue-600 font-semibold mb-1">{method.value}</div>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Gửi tin nhắn cho chúng tôi</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0123456789"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Công ty
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="Tên công ty của bạn"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nội dung tin nhắn *
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Bạn muốn tư vấn về vấn đề gì?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
                                >
                                    Gửi tin nhắn
                                </button>
                            </form>
                        </div>

                        {/* Office Info */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Văn phòng của chúng tôi</h2>
                            <div className="space-y-6">
                                {offices.map((office, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">{office.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold mb-2 text-gray-900">{office.city}</h3>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p className="flex items-start">
                                                        <span className="mr-2">📍</span>
                                                        <span>{office.address}</span>
                                                    </p>
                                                    <p className="flex items-center">
                                                        <span className="mr-2">📞</span>
                                                        <span>{office.phone}</span>
                                                    </p>
                                                    <p className="flex items-center">
                                                        <span className="mr-2">📧</span>
                                                        <span>{office.email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Working Hours */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 mt-6">
                                <h3 className="text-2xl font-bold mb-4">Giờ làm việc</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Thứ 2 - Thứ 6:</span>
                                        <span className="font-semibold">8:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Thứ 7:</span>
                                        <span className="font-semibold">8:00 - 12:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Chủ nhật:</span>
                                        <span className="font-semibold">Nghỉ</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-white border-opacity-30">
                                    <p className="text-sm opacity-90">
                                        <strong>Hỗ trợ khẩn cấp 24/7:</strong><br/>
                                        Hotline: 1900-xxxx
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                        Tìm chúng tôi trên bản đồ
                    </h2>
                    <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <p className="text-xl">Google Maps sẽ được tích hợp tại đây</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                        Câu hỏi thường gặp
                    </h2>
                    <div className="space-y-4">
                        <details className="bg-white rounded-xl shadow-lg p-6 group">
                            <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                                <span>Thời gian phản hồi thường là bao lâu?</span>
                                <span className="text-blue-600 text-2xl group-open:rotate-180 transition-transform">›</span>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Chúng tôi phản hồi trong vòng 2 giờ làm việc qua email và ngay lập tức qua live chat/hotline.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl shadow-lg p-6 group">
                            <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                                <span>Tôi có thể đặt lịch demo trực tiếp không?</span>
                                <span className="text-blue-600 text-2xl group-open:rotate-180 transition-transform">›</span>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Có, bạn có thể đặt lịch demo trực tiếp với chuyên viên tư vấn qua form trên hoặc gọi hotline.
                            </p>
                        </details>
                        <details className="bg-white rounded-xl shadow-lg p-6 group">
                            <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                                <span>Có hỗ trợ tại chỗ không?</span>
                                <span className="text-blue-600 text-2xl group-open:rotate-180 transition-transform">›</span>
                            </summary>
                            <p className="mt-4 text-gray-600">
                                Với gói Enterprise, chúng tôi có dịch vụ hỗ trợ onsite và đào tạo tại chỗ.
                            </p>
                        </details>
                    </div>
                </div>
            </section>
        </div>
    )
}


















