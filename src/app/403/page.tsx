'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-6xl font-bold text-slate-800">403</h1>
      <p className="mt-2 text-lg text-slate-600">Bạn không có quyền truy cập trang này.</p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
