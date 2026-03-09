'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Coffee, ShoppingBag } from 'lucide-react';
import { getActiveTableIds } from '@/data/useOrderStore';

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function ManagerPage() {
  const router = useRouter();
  const [activeIds, setActiveIds] = useState<string[]>([]);

  const refreshActive = () => setActiveIds(getActiveTableIds());

  useEffect(() => {
    refreshActive();

    // Refresh active tables on window focus
    window.addEventListener('focus', refreshActive);

    // Also refresh every 2 seconds to ensure we see new drafts
    const interval = setInterval(refreshActive, 2000);

    return () => {
      window.removeEventListener('focus', refreshActive);
      clearInterval(interval);
    };
  }, []);

  const handleSelect = (table: number | 'mang-di') => {
    const param = table === 'mang-di' ? 'mang-di' : String(table);
    router.push(`/pos?table=${param}`);
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <h2 className="text-lg font-semibold text-slate-800">Chọn bàn hoặc mang đi</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <button
          type="button"
          onClick={() => handleSelect('mang-di')}
          className={`relative flex flex-col items-center justify-center gap-2 h-28 sm:h-32 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98] ${activeIds.includes('mang-di')
              ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-100'
              : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
        >
          {activeIds.includes('mang-di') && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium">
              Có đơn
            </span>
          )}
          <ShoppingBag size={28} className={activeIds.includes('mang-di') ? 'text-emerald-600' : 'text-slate-500'} />
          <span>Mang đi</span>
        </button>
        {TABLE_NUMBERS.map((num) => {
          const id = String(num);
          const isActive = activeIds.includes(id);
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              className={`relative flex flex-col items-center justify-center gap-2 h-28 sm:h-32 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98] ${isActive
                  ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700'
                }`}
            >
              {isActive && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium">
                  Có đơn
                </span>
              )}
              <Coffee size={28} className={isActive ? 'text-emerald-600' : 'text-slate-500'} />
              <span>Bàn {num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
