'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSubscriptions, SubscriptionPlan } from '@/apis/subscription'
import { ROLE_CODE_SHOP_OWNER, getStoredRoleNormalized } from '@/apis/auth'

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

export default function ServicesPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('accessToken'))
      setUserRole(getStoredRoleNormalized() || null)
    }
  }, [])

  useEffect(() => {
    getSubscriptions()
      .then(setPlans)
      .catch(() => setError('Không thể tải danh sách gói dịch vụ.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      router.push(`/auth?mode=login&returnUrl=/checkout?subscriptionId=${plan.subscription_id}`)
      return
    }
    router.push(
      `/checkout?subscriptionId=${plan.subscription_id}&packageCode=${plan.package_code}&price=${plan.price}&billing=${plan.billing_cycle}`,
    )
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
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Lựa chọn gói dịch vụ phù hợp với quy mô doanh nghiệp của bạn
        </p>
        {isLoggedIn && userRole === ROLE_CODE_SHOP_OWNER && (
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
            ✅ Bạn đã là Shop Owner — truy cập hệ thống{' '}
            <Link href="/pos" className="underline hover:text-green-900">
              tại đây
            </Link>
          </div>
        )}
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Chưa có gói dịch vụ nào.</div>
          ) : (
            <div
              className={`grid gap-8 ${
                plans.length <= 2
                  ? 'md:grid-cols-2 max-w-3xl mx-auto'
                  : plans.length === 3
                    ? 'md:grid-cols-3'
                    : 'md:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {plans.map((plan, index) => {
                const isPopular = index === Math.floor(plans.length / 2)
                const featureList = getFeatureList(plan.features)
                const periodLabel = BILLING_CYCLE_LABEL[plan.billing_cycle] ?? ''

                return (
                  <div
                    key={plan.subscription_id}
                    className={`relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all flex flex-col ${
                      isPopular ? 'border-4 border-blue-500 transform scale-105' : 'border border-gray-200'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        Phổ biến nhất
                      </div>
                    )}
                    <div className="mb-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {plan.package_code}
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-blue-600">
                        {formatServicePrice(plan.price)}
                      </span>
                      {periodLabel && <span className="text-gray-500 ml-1">{periodLabel}</span>}
                    </div>
                    {plan.description && (
                      <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                    )}
                    {featureList.length > 0 && (
                      <ul className="space-y-2 mb-8 flex-grow">
                        {featureList.map((f, fi) => (
                          <li key={fi} className="flex items-start text-sm">
                            <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                            <span className="text-gray-700">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto">
                      {userRole === ROLE_CODE_SHOP_OWNER ? (
                        <div className="text-center px-6 py-3 rounded-lg bg-green-50 text-green-700 font-medium text-sm">
                          ✅ Bạn đã có gói dịch vụ
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                            isPopular
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {isLoggedIn ? 'Mua ngay' : 'Đăng nhập để mua'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Dịch vụ bổ sung</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {addons.map((a, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900">{a.name}</h3>
                <div className="text-2xl font-bold text-blue-600 mb-3">{a.price}</div>
                <p className="text-gray-600 text-sm">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Bắt đầu ngay hôm nay</h2>
        {isLoggedIn ? (
          <Link
            href="/pos"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Vào hệ thống
          </Link>
        ) : (
          <Link
            href="/auth?mode=register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Đăng ký miễn phí
          </Link>
        )}
      </section>
    </div>
  )
}

