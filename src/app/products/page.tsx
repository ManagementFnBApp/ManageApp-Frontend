'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getAllProducts } from '@/apis/test'

interface Product {
  productId: number
  productName: string
  sku: string
  basicPrice: number
  unitPrice: number
  isActive: boolean
  categoryId: number
}

export default function ProductPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        setProductsError(null)
        const data = await getAllProducts()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        setProductsError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm')
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const features = [
    {
      id: 0,
      title: 'Quản lý kho',
      icon: '📦',
      description: 'Theo dõi tồn kho và cảnh báo thiếu hàng theo thời gian thực',
      details: [
        'Theo dõi số lượng nguyên liệu, đồ uống theo thời gian thực',
        'Tự động cảnh báo khi hàng tồn kho thấp',
        'Quản lý nhập – xuất kho dễ dàng',
        'Báo cáo tồn kho theo ngày / tuần / tháng',
        'Tích hợp nhà cung cấp để đặt hàng nhanh'
      ]
    },
    {
      id: 1,
      title: 'Quản lý doanh thu',
      icon: '💰',
      description: 'Theo dõi doanh thu và phân tích hiệu quả kinh doanh',
      details: [
        'Dashboard doanh thu theo thời gian thực',
        'Phân tích theo sản phẩm, nhân viên',
        'So sánh doanh thu các kỳ',
        'Báo cáo lợi nhuận chi tiết',
        'Xuất báo cáo Excel / PDF'
      ]
    },
    {
      id: 2,
      title: 'Quản lý Menu',
      icon: '📋',
      description: 'Quản lý menu linh hoạt, cập nhật nhanh chóng',
      details: [
        'Quản lý menu theo danh mục',
        'Cập nhật giá & mô tả dễ dàng',
        'Ẩn / hiện món theo thời gian',
        'Đánh dấu món hết hàng',
        'Tạo menu QR cho khách'
      ]
    },
    {
      id: 3,
      title: 'Tạo Order',
      icon: '🛒',
      description: 'Nhận order nhanh chóng, chính xác',
      details: [
        'Giao diện order dễ dùng',
        'Order theo bàn / mang đi',
        'In & gửi hóa đơn tự động',
        'Theo dõi trạng thái order',
        'Giảm sai sót cho nhân viên'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
            ☕ Phần mềm quản lý F&B
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hệ thống quản lý toàn diện cho quán cà phê
          </h1>
          <p className="text-lg text-gray-600">
            Demo các tính năng quản lý kho, doanh thu, menu và order trong một nền tảng duy nhất
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* SIDEBAR */}
            <aside className="w-64 flex-shrink-0 sticky top-24 h-fit">
              <div className="bg-white border border-gray-200 rounded-xl p-2">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition
                      ${
                        activeFeature === feature.id
                          ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    {feature.title}
                  </button>
                ))}
              </div>
            </aside>

            {/* CONTENT */}
            <div className="flex-1">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`transition-opacity duration-300 ${
                    activeFeature === feature.id ? 'block opacity-100' : 'hidden opacity-0'
                  }`}
                >
                  <div className="grid md:grid-cols-2 gap-10 items-start">
                    {/* LEFT */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                          {feature.icon}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            {feature.title}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {feature.details.map((detail, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200"
                          >
                            <span className="text-blue-600 font-bold mt-1">✓</span>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT MOCKUP */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                      {feature.id === 3 ? (
                        <div className="rounded-xl overflow-hidden">
                          <Image
                            src="/image/pos systems.png"
                            alt="Giao diện Tạo Order"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl h-72 flex flex-col items-center justify-center text-center">
                          <div className="text-5xl mb-4">{feature.icon}</div>
                          <p className="font-semibold text-gray-700">
                            Giao diện {feature.title}
                          </p>
                          <span className="text-sm text-gray-400 mt-1">
                            Demo hệ thống
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH SẢN PHẨM TỪ API */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh sách sản phẩm</h2>
          <p className="text-gray-600 mb-8">Dữ liệu được lấy từ backend API</p>

          {productsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : productsError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {productsError}
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">
              Chưa có sản phẩm nào. Hãy thêm sản phẩm qua backend hoặc API.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.productId}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="font-semibold text-gray-900">{p.productName}</div>
                  <div className="text-sm text-gray-500 mt-1">SKU: {p.sku}</div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN').format(p.unitPrice)} đ
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Sẵn sàng trải nghiệm hệ thống?
          </h2>
          <p className="text-blue-100 mb-8">
            Dùng thử miễn phí 30 ngày – không cần thẻ
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Dùng thử miễn phí
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
