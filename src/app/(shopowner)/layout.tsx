'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_CODE_ADMIN, ROLE_CODE_SHOP_OWNER, getStoredRoleNormalized } from '@/apis/auth';

export default function ShopOwnerGuardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = getStoredRoleNormalized();

    if (!token) {
      router.replace('/auth?mode=login');
      return;
    }
    if (role === 'admin') {
      router.replace('/admin');
      return;
    }
    // Cho phép SHOPOWNER và STAFF vào /manager, /pos
    if (role !== ROLE_CODE_SHOP_OWNER && role !== 'STAFF') {
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (authorized !== true) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
