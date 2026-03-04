'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_CODE_ADMIN, getStoredRoleNormalized } from '@/apis/auth';

const ROLE_CODE_SHOP_OWNER = 'SHOPOWNER';
const ROLE_CODE_STAFF = 'STAFF';

export default function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = getStoredRoleNormalized();

    if (!token || role !== 'admin') {
      router.replace('/auth?mode=login');
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
