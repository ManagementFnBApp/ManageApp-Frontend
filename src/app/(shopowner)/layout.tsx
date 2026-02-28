'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopOwnerGuardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role  = localStorage.getItem('role');

    if (!token) {
      router.replace('/auth?mode=login');
      return;
    }
    if (role === 'admin') {
      router.replace('/admin');
      return;
    }
    if (role !== 'SHOPOWNER') {
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
