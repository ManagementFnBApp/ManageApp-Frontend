'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Homepage() {
    return (
        <div>
            {/* Hero Section with Background Image */}
            <section 
                className="relative pt-32 pb-24 overflow-hidden"
                style={{
                    minHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {/* Background Image - Full Coverage */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/image/image2.jpg"
                        alt="Business Management Background"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                        className="brightness-100"
                    />
                    {/* Light overlay to make text readable - more transparent */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/60 to-transparent"></div>
                </div>

                {/* Content Floating Above */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight" style={{ 
                                letterSpacing: '-0.02em',
                                textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)'
                            }}>
                                Phần mềm quản lý bán hàng phổ biến nhất
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed" style={{ 
                                fontWeight: '500',
                                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
                            }}>
                                Hệ thống quản lý ứng dụng hiện đại và hiệu quả, giúp doanh nghiệp phát triển bền vững
                            </p>
                            <div className="flex gap-4 flex-wrap">
                                <Link 
                                    href="/register" 
                                    className="px-10 py-4 text-white rounded-xl transition-all font-bold text-lg"
                                    style={{ 
                                        backgroundColor: '#3b82f6',
                                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#2563eb'
                                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.6)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#3b82f6'
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.5)'
                                    }}
                                >
                                    Dùng thử miễn phí
                                </Link>
                                <Link 
                                    href="/about" 
                                    className="px-10 py-4 border-2 rounded-xl transition-all font-bold text-lg"
                                    style={{ 
                                        borderColor: '#3b82f6',
                                        color: '#3b82f6',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#3b82f6'
                                        e.currentTarget.style.color = 'white'
                                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                                        e.currentTarget.style.color = '#3b82f6'
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)'
                                    }}
                                >
                                    Khám phá
                                </Link>
                            </div>
                            
                            {/* Statistics */}
                            <div className="grid grid-cols-2 gap-6 pt-8">
                                <div className="text-left rounded-2xl p-6 border-2 border-blue-200"
                                    style={{ 
                                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                                        300.000+
                                    </div>
                                    <div className="text-gray-800 text-sm md:text-base font-medium">
                                        nhà kinh doanh sử dụng
                                    </div>
                                </div>
                                <div className="text-left rounded-2xl p-6 border-2 border-blue-200"
                                    style={{ 
                                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                                        10.000+
                                    </div>
                                    <div className="text-gray-800 text-sm md:text-base font-medium">
                                        nhà kinh doanh mới mỗi tháng
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gradient-to-b from-gray-50 to-white py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
                        ManageApp giúp bạn quản lý dễ dàng, bán hàng hiệu quả
                    </h2>
                    <p className="text-center text-gray-600 mb-16 text-lg md:text-xl max-w-3xl mx-auto">
                        Giải pháp toàn diện cho doanh nghiệp của bạn
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: '#dbeafe' }}>
                                ☕
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                                Đơn giản & Dễ sử dụng
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Giao diện đơn giản, thân thiện và thông minh. Chỉ mất 15 phút làm quen.
                            </p>
                        </div>
                        
                        <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: '#fed7aa' }}>
                                🎯
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                                Tiết kiệm chi phí
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Miễn phí cài đặt, triển khai, nâng cấp và hỗ trợ. Rẻ hơn mọi lý trả dễ.
                            </p>
                        </div>
                        
                        <div className="group text-center p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: '#bbf7d0' }}>
                                ✓
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                                Phù hợp cho từng ngành hàng
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Phần mềm quản lý bán hàng phù hợp cho hơn 20 ngành nghề kinh doanh khác nhau.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

