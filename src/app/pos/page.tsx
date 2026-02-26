'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MENU_CATEGORIES } from '@/data/mockMenu';
import { getActivePosProducts } from '@/data/useMenuStore';
import { savePosCart } from '@/lib/posCart';

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả' },
  ...MENU_CATEGORIES.map((c) => ({ id: c.slug, label: c.label })),
];

type OrderType = 'eat-in' | 'takeaway';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

function getShift(hour: number): { label: string; range: string } {
  if (hour >= 7 && hour < 15) return { label: 'Morning', range: '7h - 15h' };
  if (hour >= 15 && hour < 22) return { label: 'Afternoon', range: '15h - 22h' };
  return { label: 'Closed', range: '--' };
}

type PosProduct = ReturnType<typeof getActivePosProducts>[number];

export default function PosPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('Nguyen Van A');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('eat-in');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPosProducts(getActivePosProducts());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/auth?mode=login');
        return;
      }
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        router.replace('/admin');
        return;
      }
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    }
  }, [router]);

  const filteredProducts = posProducts.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' VND';

  const handleCheckout = () => {
    if (cart.length === 0) return;
    savePosCart({ items: cart, total, orderType });
    router.push('/checkout-order');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header: chỉ Pos System, Shift, Manager, thông tin tài khoản staff */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pos System</h1>
          {currentTime ? (() => {
            const shift = getShift(currentTime.getHours());
            return (
              <p className="text-gray-600 text-sm">
                Shift:{' '}
                <span className={`font-semibold ${shift.label === 'Morning' ? 'text-amber-500' : shift.label === 'Afternoon' ? 'text-blue-500' : 'text-gray-400'}`}>
                  {shift.label}
                </span>{' '}
                <span className="text-gray-400">({shift.range})</span>
              </p>
            );
          })() : (
            <p className="text-gray-600 text-sm">Shift: --</p>
          )}
          <p className="text-gray-600 text-sm">Manager: {username}</p>
        </div>
        {currentTime && (
          <div className="hidden sm:flex flex-col items-center justify-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 min-w-[110px]">
            <span className="text-2xl font-bold text-gray-800 tabular-nums tracking-tight">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 py-1.5 pl-1 pr-3 rounded-full bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {(username || 'S').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{username}</span>
            <span className="text-xs text-gray-500">Staff</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left column - Products (kéo dài theo chiều cao cột món đã chọn) */}
        <div className="flex-1 flex flex-col p-6 lg:max-w-[66.666%] min-h-0">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Order type row */}
          <div className="mb-4 flex flex-col lg:flex-row lg:items-end gap-3 flex-shrink-0">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">Tìm kiếm sản phẩm :</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Order type - moved ngang với tìm kiếm sản phẩm */}
            <div className="w-full lg:w-64">
              <div className="text-xs font-medium text-gray-700 mb-1">Loại đơn hàng</div>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOrderType('eat-in')}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                    orderType === 'eat-in'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Eat-in
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                    orderType === 'takeaway'
                      ? 'bg-amber-400 text-gray-900'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Take away
                </button>
              </div>
            </div>
          </div>

          {/* Product grid - kéo dài, scroll theo danh sách món đã chọn */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition"
              >
                <div className="aspect-square rounded-lg bg-gray-200 mb-3 flex items-center justify-center text-gray-400 text-2xl">
                  ☕
                </div>
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-blue-600 font-semibold text-sm mt-1">{formatPrice(product.price)}</p>
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Right column - Order summary (cùng chiều cao với cột trái) */}
        <div className="w-full lg:w-[33.333%] lg:min-w-[320px] border-l border-gray-200 bg-white flex flex-col min-h-0">
          {/* Order items - light green area */}
          <div className="flex-1 min-h-0 p-4 bg-green-50/80 overflow-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Chưa có món trong đơn</p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bottom - total & checkout */}
          <div className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Tổng cộng:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
