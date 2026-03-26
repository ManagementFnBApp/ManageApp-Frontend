'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROLE_CODE_ADMIN, ROLE_CODE_SHOP_OWNER, getStoredRoleNormalized } from '@/apis/auth';
import { getMyShopSubscriptionStrict } from '@/apis/subscription';

export default function ShopOwnerGuardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = localStorage.getItem('accessToken');
      const role = getStoredRoleNormalized();

      if (!token) {
        router.replace('/auth?mode=login');
        return;
      }
      if (role === ROLE_CODE_ADMIN) {
        router.replace('/admin');
        return;
      }
      // Cho phép SHOPOWNER và STAFF vào /manager, /pos
      if (role !== ROLE_CODE_SHOP_OWNER && role !== 'STAFF') {
        router.replace('/');
        return;
      }

      // Kiểm tra hạn subscription — chỉ áp dụng cho SHOPOWNER.
      // STAFF không cần check vì họ không có quyền gia hạn.
      if (role === ROLE_CODE_SHOP_OWNER) {
        try {
          const sub = await getMyShopSubscriptionStrict();
          const isExpired = Boolean(sub?.is_expired);
          const isSubscriptionPage = pathname?.startsWith('/manager/subscription');

          if (isExpired && !isSubscriptionPage) {
            router.replace('/manager/subscription');
            return;
          }
        } catch {
          // Lỗi mạng / API tạm thời → fail-open: không chặn người dùng.
          // Tránh redirect nhầm khi subscription vẫn còn hạn nhưng mạng bị gián đoạn.
        }
      }

      if (!cancelled) setAuthorized(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (authorized !== true) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
