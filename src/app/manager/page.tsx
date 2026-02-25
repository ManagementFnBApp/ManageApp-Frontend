'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/apis/auth';

interface ActionItem {
  id: string;
  label: string;
  color: 'mauve' | 'lime' | 'red' | 'blue';
}

const ROWS: ActionItem[][] = [
  [
    { id: 'create-order', label: 'Tạo Đơn Hàng', color: 'mauve' },
    { id: 'report-all', label: 'Báo cáo ( cả ngày )', color: 'mauve' },
    { id: 'report-morning', label: 'Báo cáo ( sáng )', color: 'mauve' },
    { id: 'report-afternoon', label: 'Báo cáo ( chiều )', color: 'mauve' },
  ],
  [
    { id: 'goods', label: 'Hàng hóa', color: 'lime' },
    { id: 'menu', label: 'Quản lý Menu', color: 'lime' },
    { id: 'cancel-order', label: 'Phiếu hủy hàng', color: 'red' },
  ],
  [
    { id: 'import-goods', label: 'Phiếu nhập hàng', color: 'blue' },
  ],
];

const COLOR_MAP: Record<ActionItem['color'], string> = {
  mauve: 'bg-[#9e7d7d] hover:bg-[#8a6a6a] active:bg-[#7a5a5a] text-white',
  lime:  'bg-[#c8e04a] hover:bg-[#b4cc38] active:bg-[#a0b828] text-white',
  red:   'bg-[#e84c4c] hover:bg-[#d43a3a] active:bg-[#c02828] text-white',
  blue:  'bg-[#4c5be8] hover:bg-[#3a49d4] active:bg-[#2837c0] text-white',
};

export default function ManagerPage() {
  const router = useRouter();
  const [managerName, setManagerName] = useState<string>('Manager');

  useEffect(() => {
    const name = localStorage.getItem('username');
    if (name) setManagerName(name);
  }, []);

  const handleAction = (id: string) => {
    switch (id) {
      case 'create-order': router.push('/pos'); break;
      case 'menu': router.push('/manager/menu'); break;
      default: alert('Tính năng đang được phát triển.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#e0e0e0] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-10 py-5 bg-[#e0e0e0] border-b border-gray-400/50">
        {/* Brand */}
        <div className="flex items-center gap-3 border-2 border-dashed border-gray-400 rounded-lg px-4 py-2 min-w-[160px]">
          <svg className="w-7 h-7 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-500 leading-snug font-medium">
            Brand Name and<br />logo
          </span>
        </div>

        {/* Title badge */}
        <div className="px-12 py-3 bg-[#9a8a6a] rounded-2xl shadow-sm">
          <h1 className="text-white font-semibold text-xl tracking-wide">Manager Dashboard</h1>
        </div>

        {/* Avatar + Logout */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg shadow">
              {managerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 font-medium">{managerName}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Action Grid ── */}
      <main className="flex-1 flex flex-col justify-start gap-7 px-10 py-10">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-7">
            {row.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAction(item.id)}
                className={`
                  flex-none w-90 h-45 rounded-[20px] font-bold text-lg
                  shadow-md transition-all duration-150 active:scale-95 active:shadow-sm
                  ${COLOR_MAP[item.color]}
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
