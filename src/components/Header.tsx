'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => pathname === path

  const navItemClass = (active: boolean) =>
    `relative px-4 py-2 rounded-full text-sm font-medium transition-all
     ${active
        ? 'bg-white text-blue-600 shadow-md'
        : 'text-gray-700 hover:text-blue-600'
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
            <div className="hidden md:flex items-center space-x-2">
              {[
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

                  {/* Arrow indicator */}
                  {isActive(item.href) && (
                    <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 shadow-md"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Đăng ký
              </Link>
            </div>

          </div>
        </div>
      </nav>
    </header>
  )
}
