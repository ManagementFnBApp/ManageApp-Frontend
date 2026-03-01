'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllProducts } from '@/apis/test'
import { getSubscriptions, SubscriptionPlan } from '@/apis/subscription'
import { ROLE_CODE_SHOP_OWNER, getStoredRoleNormalized } from '@/apis/auth'

// ─────────────────────────────────────────────
// Shared types / helpers (Services)
// ─────────────────────────────────────────────
interface Product {
  productId: number
  productName: string
  sku: string
  basicPrice: number
  unitPrice: number
  isActive: boolean
  categoryId: number
}

const BILLING_CYCLE_LABEL: Record<string, string> = {
  MONTHLY: '/tháng',
  YEARLY: '/năm',
  ONCE: '',
}

function formatServicePrice(price: number): string {
  if (price === 0) return '0đ'
  return price.toLocaleString('vi-VN') + 'đ'
}

function getFeatureList(features: SubscriptionPlan['features']): string[] {
  if (!features) return []
  if (Array.isArray(features)) return features.map(String)
  if (typeof features === 'object') return Object.values(features).map(String)
  return []
}

const supportColorMap: { [key: string]: string } = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-emerald-600 hover:bg-emerald-700',
  red: 'bg-red-600 hover:bg-red-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
}

// ─────────────────────────────────────────────
// AboutPage
// ─────────────────────────────────────────────
export function AboutPage() {
  const stats = [
    { number: '300K+', label: 'Khách hàng' },
    { number: '50+', label: 'Tỉnh thành' },
    { number: '20+', label: 'Ngành hàng' },
    { number: '99.9%', label: 'Uptime' },
  ]
  const timeline = [
    { year: '2020', title: 'Khởi đầu', description: 'ManageApp được thành lập với sứ mệnh số hóa doanh nghiệp Việt', icon: '🚀' },
    { year: '2021', title: 'Tăng trưởng', description: 'Đạt 10.000 khách hàng đầu tiên và mở rộng ra 20 tỉnh thành', icon: '📈' },
    { year: '2022', title: 'Mở rộng', description: 'Ra mắt ứng dụng mobile và tích hợp với các nền tảng lớn', icon: '📱' },
    { year: '2023', title: 'Đổi mới', description: 'Ứng dụng AI và Machine Learning vào sản phẩm', icon: '🤖' },
    { year: '2024', title: 'Dẫn đầu', description: 'Trở thành nền tảng quản lý bán hàng số 1 Việt Nam', icon: '🏆' },
    { year: '2026', title: 'Tương lai', description: 'Hướng tới 1 triệu doanh nghiệp và mở rộng ra khu vực', icon: '🌏' },
  ]
  const team = [
    { name: 'Nguyễn Văn A', role: 'CEO & Founder', avatar: '👨‍💼', description: '15 năm kinh nghiệm trong ngành công nghệ' },
    { name: 'Trần Thị B', role: 'CTO', avatar: '👩‍💻', description: 'Chuyên gia về AI và Machine Learning' },
    { name: 'Lê Minh C', role: 'CPO', avatar: '👨‍🎨', description: '10 năm kinh nghiệm thiết kế sản phẩm' },
    { name: 'Phạm Thu D', role: 'Head of Customer Success', avatar: '👩‍💼', description: 'Đam mê mang đến trải nghiệm tốt nhất' },
  ]
  const values = [
    { icon: '🎯', title: 'Tập trung khách hàng', description: 'Khách hàng là trung tâm của mọi quyết định' },
    { icon: '🚀', title: 'Đổi mới không ngừng', description: 'Luôn tìm kiếm cách làm tốt hơn' },
    { icon: '🤝', title: 'Hợp tác cùng phát triển', description: 'Thành công của khách hàng là thành công của chúng tôi' },
    { icon: '💡', title: 'Đơn giản hóa', description: 'Làm cho mọi thứ trở nên dễ dàng hơn' },
  ]
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Về ManageApp</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">Chúng tôi xây dựng công cụ giúp doanh nghiệp Việt Nam phát triển và thành công</p>
        </div>
      </section>
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{s.number}</div>
                <div className="text-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4"><div className="container mx-auto max-w-4xl text-center"><h2 className="text-4xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2><p className="text-xl text-gray-600 leading-relaxed">Chúng tôi tin rằng mọi doanh nghiệp, dù lớn hay nhỏ, đều xứng đáng có được công cụ quản lý hiện đại, dễ sử dụng và giá cả phải chăng.</p></div></section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Hành trình phát triển</h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            {timeline.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{item.year}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {values.map((v, i) => (
              <div key={i} className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{v.title}</h3>
                <p className="text-gray-600">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Đội ngũ lãnh đạo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((m, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all text-center">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-8xl">{m.avatar}</div>
                <div className="p-6"><h3 className="text-xl font-bold mb-1 text-gray-900">{m.name}</h3><div className="text-blue-600 font-semibold mb-3">{m.role}</div><p className="text-gray-600 text-sm">{m.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Cùng nhau phát triển</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Dùng thử miễn phí</Link>
            <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">Liên hệ với chúng tôi</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────
// ProductsPage
// ─────────────────────────────────────────────
export function ProductsPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('accessToken')
    if (!token) { setIsLoggedIn(false); return }
    setIsLoggedIn(true)
    const fetchProducts = async () => {
      try {
        setProductsLoading(true); setProductsError(null)
        const data = await getAllProducts()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setProductsError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm')
        setProducts([])
      } finally { setProductsLoading(false) }
    }
    fetchProducts()
  }, [])

  const features = [
    { id: 0, title: 'Quản lý kho', icon: '📦', description: 'Theo dõi tồn kho và cảnh báo thiếu hàng theo thời gian thực', details: ['Theo dõi số lượng theo thời gian thực', 'Tự động cảnh báo khi hàng tồn kho thấp', 'Quản lý nhập – xuất kho dễ dàng', 'Báo cáo tồn kho theo ngày / tuần / tháng', 'Tích hợp nhà cung cấp để đặt hàng nhanh'] },
    { id: 1, title: 'Quản lý doanh thu', icon: '💰', description: 'Theo dõi doanh thu và phân tích hiệu quả kinh doanh', details: ['Dashboard doanh thu theo thời gian thực', 'Phân tích theo sản phẩm, nhân viên', 'So sánh doanh thu các kỳ', 'Báo cáo lợi nhuận chi tiết', 'Xuất báo cáo Excel / PDF'] },
    { id: 2, title: 'Quản lý Menu', icon: '📋', description: 'Quản lý menu linh hoạt, cập nhật nhanh chóng', details: ['Quản lý menu theo danh mục', 'Cập nhật giá & mô tả dễ dàng', 'Ẩn / hiện món theo thời gian', 'Đánh dấu món hết hàng', 'Tạo menu QR cho khách'] },
    { id: 3, title: 'Tạo Order', icon: '🛒', description: 'Nhận order nhanh chóng, chính xác', details: ['Giao diện order dễ dùng', 'Order theo bàn / mang đi', 'In & gửi hóa đơn tự động', 'Theo dõi trạng thái order', 'Giảm sai sót cho nhân viên'] },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-28 pb-16"><div className="container mx-auto px-4 text-center max-w-4xl"><span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">☕ Phần mềm quản lý F&B</span><h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Hệ thống quản lý toàn diện cho quán cà phê</h1></div></section>
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <aside className="w-64 flex-shrink-0 sticky top-24 h-fit">
              <div className="bg-white border border-gray-200 rounded-xl p-2">
                {features.map((f) => (
                  <button key={f.id} onClick={() => setActiveFeature(f.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition ${activeFeature === f.id ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <span className="text-lg">{f.icon}</span>{f.title}
                  </button>
                ))}
              </div>
            </aside>
            <div className="flex-1">
              {features.map((f) => (
                <div key={f.id} className={activeFeature === f.id ? 'block' : 'hidden'}>
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">{f.icon}</div><div><h2 className="text-3xl font-bold text-gray-900">{f.title}</h2><p className="text-gray-600 mt-1">{f.description}</p></div></div>
                      <div className="grid sm:grid-cols-2 gap-4">{f.details.map((d, i) => <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200"><span className="text-blue-600 font-bold mt-1">✓</span><p className="text-gray-700 text-sm leading-relaxed">{d}</p></div>)}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                      {f.id === 3 ? <div className="rounded-xl overflow-hidden"><Image src="/image/pos systems.png" alt="POS" width={0} height={0} sizes="100vw" className="w-full h-auto" /></div> : <div className="bg-gray-100 rounded-xl h-72 flex flex-col items-center justify-center text-center"><div className="text-5xl mb-4">{f.icon}</div><p className="font-semibold text-gray-700">Giao diện {f.title}</p></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh sách sản phẩm</h2>
          {!isLoggedIn ? <div className="p-10 bg-blue-50 border border-blue-100 rounded-2xl text-center"><div className="text-5xl mb-4">🔐</div><p className="text-gray-700 font-medium text-lg mb-6">Vui lòng đăng nhập để xem danh sách sản phẩm</p><a href="/auth?mode=login" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Đăng nhập ngay</a></div>
            : productsLoading ? <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" /></div>
            : productsError ? <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">{productsError}</div>
            : products.length === 0 ? <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">Chưa có sản phẩm nào.</div>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{products.map((p) => <div key={p.productId} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"><div className="font-semibold text-gray-900">{p.productName}</div><div className="text-sm text-gray-500 mt-1">SKU: {p.sku}</div><div className="mt-3 flex justify-between items-center"><span className="text-lg font-bold text-blue-600">{new Intl.NumberFormat('vi-VN').format(p.unitPrice)} đ</span><span className={`px-2 py-1 rounded text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.isActive ? 'Đang bán' : 'Ngừng bán'}</span></div></div>)}</div>}
        </div>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────
// SolutionsPage
// ─────────────────────────────────────────────
export function SolutionsPage() {
  const solutions = [
    { icon: '🏪', color: 'bg-blue-100', title: 'Bán lẻ', desc: 'Giải pháp quản lý cửa hàng, kho hàng, nhân viên và khách hàng.', items: ['Quản lý tồn kho', 'POS bán hàng', 'Quản lý nhân viên'] },
    { icon: '🍽️', color: 'bg-orange-100', title: 'Nhà hàng - F&B', desc: 'Quản lý nhà hàng, cafe với hệ thống order, bếp và thanh toán thông minh.', items: ['Quản lý bàn', 'Order online', 'Kết nối bếp'] },
    { icon: '👗', color: 'bg-purple-100', title: 'Thời trang', desc: 'Quản lý size, màu sắc, mùa vụ và đa kênh bán hàng.', items: ['Quản lý thuộc tính', 'Đa kênh bán', 'CRM khách hàng'] },
    { icon: '💆', color: 'bg-pink-100', title: 'Spa - Salon', desc: 'Đặt lịch, quản lý dịch vụ, liệu trình và chăm sóc khách hàng.', items: ['Đặt lịch online', 'Quản lý liệu trình', 'Chăm sóc khách'] },
    { icon: '💊', color: 'bg-green-100', title: 'Nhà thuốc', desc: 'Quản lý thuốc, hạn dùng, công thức và tuân thủ quy định ngành dược.', items: ['Quản lý hạn dùng', 'Công thức bào chế', 'Báo cáo cơ quan'] },
  ]
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4 text-center"><h1 className="text-5xl font-bold text-gray-900 mb-6">Giải pháp toàn diện</h1><p className="text-xl text-gray-600 max-w-3xl mx-auto">ManageApp cung cấp giải pháp quản lý bán hàng toàn diện cho mọi quy mô doanh nghiệp</p></section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
                <div className={`w-16 h-16 ${s.color} rounded-full flex items-center justify-center mb-6`}><span className="text-3xl">{s.icon}</span></div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{s.title}</h3>
                <p className="text-gray-600 mb-6">{s.desc}</p>
                <ul className="space-y-2 text-gray-600 mb-6">{s.items.map((item, j) => <li key={j} className="flex items-center"><span className="text-green-500 mr-2">✓</span>{item}</li>)}</ul>
                <Link href="/contact" className="text-blue-600 font-semibold hover:text-blue-700">Tìm hiểu thêm →</Link>
              </div>
            ))}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6"><span className="text-3xl">🎯</span></div>
              <h3 className="text-2xl font-bold mb-4">Và nhiều ngành hàng khác</h3>
              <p className="mb-6 opacity-90">Siêu thị, mỹ phẩm, điện máy, xe máy...</p>
              <Link href="/contact" className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">Liên hệ tư vấn</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-blue-900 text-white py-20 px-4 text-center"><h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2><Link href="/register" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">Đăng ký ngay</Link></section>
    </div>
  )
}

// ─────────────────────────────────────────────
// CustomersPage
// ─────────────────────────────────────────────
export function CustomersPage() {
  const testimonials = [
    { name: 'Nguyễn Văn A', role: 'CEO', company: 'Cửa hàng thời trang ABC', avatar: '👨‍💼', content: 'ManageApp giúp tôi quản lý 5 cửa hàng một cách dễ dàng. Doanh thu tăng 40% sau 6 tháng sử dụng.', rating: 5 },
    { name: 'Trần Thị B', role: 'Chủ nhà hàng', company: 'Nhà hàng Hương Việt', avatar: '👩‍💼', content: 'Hệ thống đặt bàn và order online rất tiện lợi. Khách hàng rất hài lòng với trải nghiệm.', rating: 5 },
    { name: 'Lê Minh C', role: 'Giám đốc', company: 'Siêu thị mini XYZ', avatar: '👨', content: 'Quản lý kho hàng chính xác, không còn thất thoát. Tiết kiệm được rất nhiều chi phí.', rating: 5 },
    { name: 'Phạm Thu D', role: 'Chủ spa', company: 'Beauty Spa', avatar: '👩', content: 'Đặt lịch tự động, nhắc lịch khách hàng rất chuyên nghiệp. Tỷ lệ quay lại tăng 60%.', rating: 5 },
  ]
  const logos = [{ name: 'Vinmart', icon: '🏪' }, { name: 'Circle K', icon: '🏬' }, { name: 'Highlands', icon: '☕' }, { name: 'The Coffee House', icon: '🍵' }, { name: 'Guardian', icon: '💊' }, { name: 'Pharmacity', icon: '⚕️' }]
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Khách hàng tin tưởng</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">Hơn 300.000+ doanh nghiệp đã lựa chọn ManageApp</p>
        <div className="flex justify-center gap-12">{[['300K+', 'Khách hàng'], ['98%', 'Hài lòng'], ['24/7', 'Hỗ trợ']].map(([n, l], i) => <div key={i}><div className="text-4xl font-bold text-blue-600">{n}</div><div className="text-gray-600">{l}</div></div>)}</div>
      </section>
      <section className="py-16 px-4 bg-white"><div className="container mx-auto"><h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Đối tác tiêu biểu</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">{logos.map((l, i) => <div key={i} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"><div className="text-5xl mb-2">{l.icon}</div><div className="text-sm font-semibold text-gray-700">{l.name}</div></div>)}</div></div></section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto"><h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">{testimonials.map((t, i) => <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"><div className="flex items-center mb-4"><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-3">{t.avatar}</div><div><div className="font-bold text-gray-900">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div></div></div><div className="text-sm text-gray-600 font-medium mb-3">{t.company}</div><div className="flex mb-3">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400">⭐</span>)}</div><p className="text-gray-700 italic">&ldquo;{t.content}&rdquo;</p></div>)}</div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-20 px-4 text-center"><h2 className="text-4xl font-bold mb-6">Bạn muốn thành công như họ?</h2><a href="/register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Dùng thử miễn phí</a></section>
    </div>
  )
}

// ─────────────────────────────────────────────
// ServicesPage
// ─────────────────────────────────────────────
export function ServicesPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('accessToken'))
      setUserRole(getStoredRoleNormalized() || null) // Khớp role từ API backend
    }
  }, [])
  useEffect(() => {
    getSubscriptions().then(setPlans).catch(() => setError('Không thể tải danh sách gói dịch vụ.')).finally(() => setIsLoading(false))
  }, [])

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) { router.push(`/auth?mode=login&returnUrl=/checkout?subscriptionId=${plan.subscription_id}`); return }
    router.push(`/checkout?subscriptionId=${plan.subscription_id}&packageCode=${plan.package_code}&price=${plan.price}&billing=${plan.billing_cycle}`)
  }

  const addons = [
    { name: 'Website bán hàng', price: '299.000đ/tháng', description: 'Website riêng với tên miền của bạn' },
    { name: 'App mobile branded', price: '499.000đ/tháng', description: 'App với logo và thương hiệu của bạn' },
    { name: 'Tích hợp Shopee/Lazada', price: '199.000đ/tháng', description: 'Đồng bộ đơn hàng và tồn kho tự động' },
    { name: 'SMS Marketing', price: 'Theo gói', description: 'Gửi tin nhắn khuyến mãi cho khách hàng' },
  ]

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Bảng giá dịch vụ</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">Lựa chọn gói dịch vụ phù hợp với quy mô doanh nghiệp của bạn</p>
        {isLoggedIn && userRole === ROLE_CODE_SHOP_OWNER && <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">✅ Bạn đã là Shop Owner — truy cập hệ thống <Link href="/pos" className="underline hover:text-green-900">tại đây</Link></div>}
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {isLoading ? <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            : error ? <div className="text-center py-20 text-red-500">{error}</div>
            : plans.length === 0 ? <div className="text-center py-20 text-gray-500">Chưa có gói dịch vụ nào.</div>
            : <div className={`grid gap-8 ${plans.length <= 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
                {plans.map((plan, index) => {
                  const isPopular = index === Math.floor(plans.length / 2)
                  const featureList = getFeatureList(plan.features)
                  const periodLabel = BILLING_CYCLE_LABEL[plan.billing_cycle] ?? ''
                  return (
                    <div key={plan.subscription_id} className={`relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all flex flex-col ${isPopular ? 'border-4 border-blue-500 transform scale-105' : 'border border-gray-200'}`}>
                      {isPopular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Phổ biến nhất</div>}
                      <div className="mb-4"><span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{plan.package_code}</span></div>
                      <div className="mb-4"><span className="text-4xl font-bold text-blue-600">{formatServicePrice(plan.price)}</span>{periodLabel && <span className="text-gray-500 ml-1">{periodLabel}</span>}</div>
                      {plan.description && <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>}
                      {featureList.length > 0 && <ul className="space-y-2 mb-8 flex-grow">{featureList.map((f, fi) => <li key={fi} className="flex items-start text-sm"><span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span><span className="text-gray-700">{f}</span></li>)}</ul>}
                      <div className="mt-auto">
                        {userRole === ROLE_CODE_SHOP_OWNER ? <div className="text-center px-6 py-3 rounded-lg bg-green-50 text-green-700 font-medium text-sm">✅ Bạn đã có gói dịch vụ</div>
                          : <button onClick={() => handleSelectPlan(plan)} className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{isLoggedIn ? 'Mua ngay' : 'Đăng nhập để mua'}</button>}
                      </div>
                    </div>
                  )
                })}
              </div>}
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto"><h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Dịch vụ bổ sung</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">{addons.map((a, i) => <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"><h3 className="text-xl font-bold mb-2 text-gray-900">{a.name}</h3><div className="text-2xl font-bold text-blue-600 mb-3">{a.price}</div><p className="text-gray-600 text-sm">{a.description}</p></div>)}</div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Bắt đầu ngay hôm nay</h2>
        {isLoggedIn ? <Link href="/pos" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">Vào hệ thống</Link>
          : <Link href="/auth?mode=register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">Đăng ký miễn phí</Link>}
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────
// SupportPage
// ─────────────────────────────────────────────
export function SupportPage() {
  const supportChannels = [
    { icon: '📞', title: 'Hotline hỗ trợ', description: '1900-xxxx (8:00 - 22:00 hàng ngày)', action: 'Gọi ngay', color: 'blue' },
    { icon: '💬', title: 'Live Chat', description: 'Trò chuyện trực tiếp với đội ngũ hỗ trợ', action: 'Chat ngay', color: 'green' },
    { icon: '📧', title: 'Email', description: 'support@manageapp.com', action: 'Gửi email', color: 'purple' },
    { icon: '📱', title: 'Zalo', description: 'Kết nối qua Zalo OA', action: 'Chat Zalo', color: 'blue' },
  ]
  const guides = [
    { icon: '📚', title: 'Hướng dẫn sử dụng', description: 'Tài liệu chi tiết về các tính năng', link: '/guides' },
    { icon: '🎥', title: 'Video tutorials', description: 'Học qua video ngắn dễ hiểu', link: '/videos' },
    { icon: '💡', title: 'Tips & Tricks', description: 'Mẹo sử dụng hiệu quả', link: '/tips' },
    { icon: '🔄', title: 'Cập nhật mới', description: 'Tính năng và cải tiến mới nhất', link: '/updates' },
  ]
  const faqs = [
    { category: 'Bắt đầu sử dụng', questions: [{ q: 'Làm thế nào để tạo tài khoản?', a: 'Bạn click vào nút Đăng ký ở góc trên bên phải, điền thông tin và xác nhận email là có thể bắt đầu sử dụng ngay.' }, { q: 'Tôi có thể nhập dữ liệu từ Excel không?', a: 'Có, bạn có thể nhập dữ liệu hàng loạt từ file Excel.' }, { q: 'Cần bao lâu để thiết lập xong?', a: 'Thông thường chỉ mất 15-30 phút để thiết lập cơ bản.' }] },
    { category: 'Thanh toán & Gói dịch vụ', questions: [{ q: 'Có gói dùng thử miễn phí không?', a: 'Có, bạn được dùng thử miễn phí 14 ngày với đầy đủ tính năng.' }, { q: 'Các phương thức thanh toán nào được chấp nhận?', a: 'Chuyển khoản ngân hàng, thẻ ATM, Visa/Mastercard, ví điện tử...' }, { q: 'Có được hoàn tiền không?', a: 'Nếu bạn không hài lòng trong 30 ngày đầu, chúng tôi hoàn lại 100% tiền.' }] },
    { category: 'Bảo mật & Dữ liệu', questions: [{ q: 'Dữ liệu của tôi có an toàn không?', a: 'Tất cả dữ liệu được mã hóa và backup tự động hàng ngày.' }, { q: 'Tôi có thể xuất dữ liệu ra không?', a: 'Có, bạn có thể xuất dữ liệu sang Excel/CSV bất cứ lúc nào.' }] },
  ]
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4 text-center"><h1 className="text-5xl font-bold text-gray-900 mb-6">Trung tâm hỗ trợ</h1></section>
      <section className="py-20 px-4">
        <div className="container mx-auto"><h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Liên hệ với chúng tôi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{supportChannels.map((c, i) => <div key={i} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all"><div className="text-5xl mb-4">{c.icon}</div><h3 className="text-xl font-bold mb-2 text-gray-900">{c.title}</h3><p className="text-gray-600 mb-4 text-sm">{c.description}</p><button className={`px-6 py-2 ${supportColorMap[c.color]} text-white rounded-lg font-semibold transition-colors`}>{c.action}</button></div>)}</div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto"><h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Tài nguyên hỗ trợ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{guides.map((g, i) => <Link key={i} href={g.link} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all group"><div className="text-4xl mb-4">{g.icon}</div><h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600">{g.title}</h3><p className="text-gray-600 text-sm">{g.description}</p></Link>)}</div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl"><h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Câu hỏi thường gặp</h2>
          <div className="space-y-8">{faqs.map((s, si) => <div key={si}><h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center"><span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>{s.category}</h3><div className="space-y-4">{s.questions.map((item, qi) => <details key={qi} className="bg-white rounded-xl shadow-lg p-6 group"><summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between"><span>{item.q}</span><span className="text-blue-600 text-2xl">›</span></summary><p className="mt-4 text-gray-600 leading-relaxed">{item.a}</p></details>)}</div></div>)}</div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Vẫn cần hỗ trợ thêm?</h2>
        <div className="flex gap-4 justify-center flex-wrap"><Link href="/contact" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Gửi yêu cầu hỗ trợ</Link><a href="tel:1900xxxx" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">Gọi ngay: 1900-xxxx</a></div>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────
// NewsPage
// ─────────────────────────────────────────────
export function NewsPage() {
  const featured = { title: 'ManageApp ra mắt tính năng AI dự đoán xu hướng bán hàng', excerpt: 'Công nghệ AI mới giúp doanh nghiệp dự đoán chính xác nhu cầu khách hàng', date: '27/01/2026', category: 'Sản phẩm', image: '🤖', readTime: '5 phút đọc' }
  const news = [
    { title: 'ManageApp đạt 300.000 khách hàng trên toàn quốc', excerpt: 'Chúng tôi tự hào thông báo đã phục vụ hơn 300.000 doanh nghiệp', date: '25/01/2026', category: 'Công ty', image: '🎉' },
    { title: 'Tích hợp thanh toán QR Code với 15 ngân hàng lớn', excerpt: 'Khách hàng giờ có thể thanh toán nhanh chóng qua QR Code', date: '20/01/2026', category: 'Tính năng', image: '📱' },
    { title: 'Hợp tác với Shopee và Lazada để đồng bộ đơn hàng', excerpt: 'Tích hợp sâu với các sàn TMĐT giúp quản lý đơn hàng đa kênh', date: '15/01/2026', category: 'Đối tác', image: '🤝' },
    { title: '10 tips quản lý kho hàng hiệu quả cho cửa hàng nhỏ', excerpt: 'Chia sẻ kinh nghiệm từ các chuyên gia về cách quản lý tồn kho', date: '12/01/2026', category: 'Hướng dẫn', image: '📦' },
    { title: 'ManageApp Mobile App đạt 4.8⭐ trên cả iOS và Android', excerpt: 'Ứng dụng di động nhận được đánh giá cao từ cộng đồng người dùng', date: '08/01/2026', category: 'Sản phẩm', image: '📱' },
    { title: 'Webinar: Chuyển đổi số cho doanh nghiệp nhỏ', excerpt: 'Tham gia webinar miễn phí về xu hướng chuyển đổi số năm 2026', date: '05/01/2026', category: 'Sự kiện', image: '🎓' },
  ]
  const categories = ['Tất cả', 'Sản phẩm', 'Tính năng', 'Công ty', 'Hướng dẫn', 'Sự kiện', 'Đối tác']
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4 text-center"><h1 className="text-5xl font-bold text-gray-900 mb-6">Tin tức & Cập nhật</h1><p className="text-xl text-gray-600 max-w-3xl mx-auto">Cập nhật mới nhất về sản phẩm, tính năng và xu hướng ngành</p></section>
      <section className="py-8 px-4 bg-white sticky top-20 z-40 border-b"><div className="container mx-auto"><div className="flex gap-3 overflow-x-auto pb-2">{categories.map((cat, i) => <button key={i} className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cat}</button>)}</div></div></section>
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 md:p-12 text-white flex flex-col justify-center"><div className="inline-block px-4 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-4 w-fit">{featured.category}</div><h2 className="text-3xl md:text-4xl font-bold mb-4">{featured.title}</h2><p className="text-lg mb-6 opacity-90">{featured.excerpt}</p><div className="flex items-center gap-4 text-sm opacity-80 mb-6"><span>📅 {featured.date}</span><span>⏱️ {featured.readTime}</span></div><button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit">Đọc thêm →</button></div>
              <div className="flex items-center justify-center p-12 text-9xl">{featured.image}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 px-4">
        <div className="container mx-auto"><h2 className="text-3xl font-bold mb-8 text-gray-900">Tin tức mới nhất</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{news.map((a, i) => <article key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"><div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-7xl">{a.image}</div><div className="p-6"><div className="flex items-center justify-between mb-3"><span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">{a.category}</span><span className="text-xs text-gray-500">{a.date}</span></div><h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">{a.title}</h3><p className="text-gray-600 text-sm mb-4 line-clamp-3">{a.excerpt}</p><button className="text-blue-600 font-semibold hover:text-blue-700 text-sm">Đọc thêm →</button></div></article>)}</div>
        </div>
      </section>
      <section className="bg-gray-900 text-white py-20 px-4 text-center"><div className="text-5xl mb-6">📬</div><h2 className="text-4xl font-bold mb-4">Đăng ký nhận tin tức</h2><div className="flex gap-3 max-w-lg mx-auto"><input type="email" placeholder="Nhập email của bạn..." className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none" /><button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap">Đăng ký</button></div></section>
    </div>
  )
}
