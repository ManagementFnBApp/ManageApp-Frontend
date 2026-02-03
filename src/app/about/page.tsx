'use client'

import Link from 'next/link'

export default function AboutPage() {
    const stats = [
        { number: "300K+", label: "Khách hàng" },
        { number: "50+", label: "Tỉnh thành" },
        { number: "20+", label: "Ngành hàng" },
        { number: "99.9%", label: "Uptime" }
    ]

    const timeline = [
        {
            year: "2020",
            title: "Khởi đầu",
            description: "ManageApp được thành lập với sứ mệnh số hóa doanh nghiệp Việt",
            icon: "🚀"
        },
        {
            year: "2021",
            title: "Tăng trưởng",
            description: "Đạt 10.000 khách hàng đầu tiên và mở rộng ra 20 tỉnh thành",
            icon: "📈"
        },
        {
            year: "2022",
            title: "Mở rộng",
            description: "Ra mắt ứng dụng mobile và tích hợp với các nền tảng lớn",
            icon: "📱"
        },
        {
            year: "2023",
            title: "Đổi mới",
            description: "Ứng dụng AI và Machine Learning vào sản phẩm",
            icon: "🤖"
        },
        {
            year: "2024",
            title: "Dẫn đầu",
            description: "Trở thành nền tảng quản lý bán hàng số 1 Việt Nam",
            icon: "🏆"
        },
        {
            year: "2026",
            title: "Tương lai",
            description: "Hướng tới 1 triệu doanh nghiệp và mở rộng ra khu vực",
            icon: "🌏"
        }
    ]

    const team = [
        {
            name: "Nguyễn Văn A",
            role: "CEO & Founder",
            avatar: "👨‍💼",
            description: "15 năm kinh nghiệm trong ngành công nghệ"
        },
        {
            name: "Trần Thị B",
            role: "CTO",
            avatar: "👩‍💻",
            description: "Chuyên gia về AI và Machine Learning"
        },
        {
            name: "Lê Minh C",
            role: "CPO",
            avatar: "👨‍🎨",
            description: "10 năm kinh nghiệm thiết kế sản phẩm"
        },
        {
            name: "Phạm Thu D",
            role: "Head of Customer Success",
            avatar: "👩‍💼",
            description: "Đam mê mang đến trải nghiệm tốt nhất"
        }
    ]

    const values = [
        {
            icon: "🎯",
            title: "Tập trung khách hàng",
            description: "Khách hàng là trung tâm của mọi quyết định"
        },
        {
            icon: "🚀",
            title: "Đổi mới không ngừng",
            description: "Luôn tìm kiếm cách làm tốt hơn"
        },
        {
            icon: "🤝",
            title: "Hợp tác cùng phát triển",
            description: "Thành công của khách hàng là thành công của chúng tôi"
        },
        {
            icon: "💡",
            title: "Đơn giản hóa",
            description: "Làm cho mọi thứ trở nên dễ dàng hơn"
        }
    ]

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Về ManageApp
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Chúng tôi xây dựng công cụ giúp doanh nghiệp Việt Nam phát triển và thành công
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Chúng tôi tin rằng mọi doanh nghiệp, dù lớn hay nhỏ, đều xứng đáng có được 
                            công cụ quản lý hiện đại, dễ sử dụng và giá cả phải chăng. ManageApp được 
                            tạo ra để giúp hàng triệu doanh nghiệp Việt Nam chuyển đổi số, tăng trưởng 
                            bền vững và cạnh tranh thành công trên thị trường.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
                        Hành trình phát triển
                    </h2>
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {timeline.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="relative bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all"
                                >
                                    <div className="text-6xl mb-4">{item.icon}</div>
                                    <div className="text-3xl font-bold text-blue-600 mb-2">{item.year}</div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Giá trị cốt lõi
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
                        Những nguyên tắc định hướng cách chúng tôi làm việc và phục vụ khách hàng
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div 
                                key={index} 
                                className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg hover:shadow-2xl transition-all"
                            >
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
                        Đội ngũ lãnh đạo
                    </h2>
                    <p className="text-center text-gray-600 mb-12 text-lg">
                        Những người đam mê công nghệ và khách hàng
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {team.map((member, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all text-center"
                            >
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-8xl">
                                    {member.avatar}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1 text-gray-900">{member.name}</h3>
                                    <div className="text-blue-600 font-semibold mb-3">{member.role}</div>
                                    <p className="text-gray-600 text-sm">{member.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Cùng nhau phát triển</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Tham gia cùng 300.000+ doanh nghiệp đang sử dụng ManageApp để phát triển kinh doanh
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link 
                            href="/register"
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Dùng thử miễn phí
                        </Link>
                        <Link 
                            href="/contact"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Liên hệ với chúng tôi
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}







