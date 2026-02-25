'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { handleLogout } from '@/apis/auth'

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken')
      const storedUsername = localStorage.getItem('username')
      const storedRole = localStorage.getItem('role')
      setToken(storedToken)
      setIsLoggedIn(!!storedToken)
      setUsername(storedUsername)
      setRole(storedToken ? storedRole : null)
    }
  }, [pathname])

  // Ẩn header trên màn hình POS
  if (pathname.startsWith('/pos')) return null

  // Ẩn header ở trang admin (có sidebar riêng)
  if (pathname.startsWith('/admin')) return null

  const isActive = (path: string) => pathname === path

  const navItemClass = (active: boolean) =>
    `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
     ${active
        ? 'bg-white text-blue-600 shadow-lg transform-gpu style-3d-active'
        : 'text-gray-700 hover:text-blue-600 hover:scale-105'
     }`

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled
          ? 'rgba(255,255,255,0.9)'
          : 'rgba(255,255,255,0)',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: isScrolled
          ? '1px solid rgba(229,231,235,0.6)'
          : '1px solid transparent',
      }}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">MA</span>
            </div>
            <span className="font-bold text-lg text-gray-800">
              ManageApp
            </span>
          </Link>

          {/* Right Side */}
          <div className="ml-auto flex items-center space-x-8">

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-2" style={{ perspective: '1000px' }}>
              {[
                ...(isLoggedIn && role === 'SHOPOWNER' ? [{ href: '/pos', label: 'POS' }] : []),
                { href: '/products', label: 'Sản phẩm' },
                { href: '/solutions', label: 'Giải pháp' },
                { href: '/customers', label: 'Khách hàng' },
                { href: '/services', label: 'Phí dịch vụ' },
                { href: '/support', label: 'Hỗ trợ' },
                { href: '/news', label: 'Tin tức' },
                { href: '/about', label: 'Về ManageApp' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(isActive(item.href))}
                >
                  {item.label}

                  {/* Arrow indicator with 3D effect */}
                  {isActive(item.href) && (
                    <span 
                      className="absolute left-1/2 -bottom-2 w-3 h-3 bg-white shadow-lg transform-gpu style-3d-arrow"
                      style={{
                        transform: 'translateX(-50%) rotate(45deg) translateZ(8px)',
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))'
                      }}
                    ></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Auth buttons / User info */}
            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 py-1.5 pl-1 pr-2.5 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                      role === 'admin' ? 'bg-purple-500' : role === 'SHOPOWNER' ? 'bg-green-500' : 'bg-blue-400'
                    }`}>
                      {(username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700 text-sm max-w-[100px] truncate">
                      {username || 'Tài khoản'}
                    </span>
                    {role === 'admin' && (
                      <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-1.5 py-0.5 rounded-full">Admin</span>
                    )}
                    {role === 'SHOPOWNER' && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Shop Owner</span>
                    )}
                    <svg className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-52 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{username || 'Tài khoản'}</p>
                          <p className="text-xs text-gray-500">
                            {role === 'admin' ? '👑 Quản trị viên' : role === 'SHOPOWNER' ? '🏪 Shop Owner' : '👤 Chưa kích hoạt gói'}
                          </p>
                        </div>
                        {role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition flex items-center gap-2"
                          >
                            🏠 Admin Dashboard
                          </Link>
                        )}
                        {role === 'SHOPOWNER' && (
                          <Link
                            href="/pos"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition flex items-center gap-2"
                          >
                            🛒 Vào hệ thống POS
                          </Link>
                        )}
                        {(!role || role === '') && (
                          <Link
                            href="/services"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition flex items-center gap-2"
                          >
                            🛍️ Mua gói dịch vụ
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth?mode=login"
                    className="px-5 py-2 text-sm font-medium rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>
    </header>
  )
}
