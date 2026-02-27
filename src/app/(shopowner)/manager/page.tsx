'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/apis/auth';
import {
  ShoppingCart, ClipboardList, Package, UtensilsCrossed,
  BarChart2, Sun, Sunset, PackageOpen, XCircle,
  LogOut, Home, ChevronDown, User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  color: string;
}

const ROWS: ActionItem[][] = [
  [
    { id: 'create-order', label: 'Tạo Đơn Hàng', icon: <ShoppingCart size={36} />, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'view-orders', label: 'Xem Đơn Hàng', icon: <ClipboardList size={36} />, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'goods', label: 'Hàng Hóa', icon: <Package size={36} />, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'menu', label: 'Quản Lý Menu', icon: <UtensilsCrossed size={36} />, color: 'bg-red-500 hover:bg-red-600' },
  ],
  [
    { id: 'report-all', label: 'Báo Cáo Cả Ngày', icon: <BarChart2 size={36} />, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'report-morning', label: 'Báo Cáo Buổi Sáng', icon: <Sun size={36} />, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'report-afternoon', label: 'Báo Cáo Buổi Chiều', icon: <Sunset size={36} />, color: 'bg-emerald-500 hover:bg-emerald-600' },
  ],
  [
    { id: 'import-goods', label: 'Phiếu Nhập Hàng', icon: <PackageOpen size={36} />, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'cancel-order', label: 'Phiếu Hủy Hàng', icon: <XCircle size={36} />, color: 'bg-blue-500 hover:bg-blue-600' },
  ],
];

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
      case 'view-orders': router.push('/manager/orders'); break;
      case 'menu': router.push('/manager/menu'); break;
      default: alert('Tính năng đang được phát triển.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">ManageApp</p>
            <p className="text-[11px] text-gray-400 leading-tight">Hệ thống quản lý</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-base font-semibold text-gray-700 tracking-wide">
          Hệ Thống Quản Lý Cửa Hàng
        </h1>

        {/* Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {managerName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{managerName}</p>
                <p className="text-[11px] text-gray-400 leading-tight">Quản lý</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="gap-2 opacity-60">
              <User size={14} />
              <span className="text-xs">{managerName}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Home size={14} />
              Trang chủ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Action Grid ── */}
      <main className="flex-1 flex flex-col gap-6 px-10 py-10 justify-center items-center">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-6">
            {row.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAction(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-4
                  h-40 w-80 rounded-2xl text-white
                  shadow-md transition-all duration-150 active:scale-95 active:shadow-sm
                  ${item.color}
                `}
              >
                {item.icon}
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
