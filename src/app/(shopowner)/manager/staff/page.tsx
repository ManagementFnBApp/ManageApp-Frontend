'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createManagedUser, getManagedUsers, getUsersForStaffPage, updateUser, CreateManagedUserDto, AppUser } from '@/apis/adminApi';
import { getStoredRoleNormalized } from '@/apis/auth';
import { UserPlus } from 'lucide-react';

type FormState = CreateManagedUserDto & { confirmPassword: string };

const initialForm: FormState = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role_code: 'STAFF',
};

function getErrorMessage(e: unknown): string {
  const err = e as { message?: string; response?: { data?: { message?: string | string[] } } };
  const msg = err?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  const apiMsg = err?.response?.data?.message;
  if (Array.isArray(apiMsg)) return apiMsg.join(', ');
  if (typeof apiMsg === 'string') return apiMsg;
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

function formatDate(d: string | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

export default function ManagerStaffPage() {
  const router = useRouter();

  const [role, setRole] = useState<string>(() => getStoredRoleNormalized());

  // Chỉ SHOPOWNER mới được truy cập trang này
  useEffect(() => {
    const syncRole = () => setRole(getStoredRoleNormalized());
    syncRole();
    window.addEventListener("lumio:role-changed", syncRole);
    return () => window.removeEventListener("lumio:role-changed", syncRole);
  }, []);

  useEffect(() => {
    if (role !== "SHOPOWNER") {
      const t = window.setTimeout(() => {
        const latest = getStoredRoleNormalized();
        if (latest !== "SHOPOWNER") router.replace("/manager");
      }, 400);
      return () => window.clearTimeout(t);
    }
  }, [role, router]);

  const [staffList, setStaffList] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userCheckError, setUserCheckError] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const uid =
      typeof window !== 'undefined' ? Number(localStorage.getItem('userId') || 0) : 0;
    const role = typeof window !== 'undefined' ? getStoredRoleNormalized() : '';
    const shopId =
      typeof window !== 'undefined' ? localStorage.getItem('shopId') : null;

    setLoading(true);
    setLoadError('');
    setUserCheckError('');

    try {
      const { users, isAdmin } = await getUsersForStaffPage();

      if (isAdmin) {
        const myStaff = users.filter(
          (u) => u.owner_manager_id != null && u.owner_manager_id === uid
        );
        const self = users.find((u) => u.user_id === uid);
        setCurrentUser(self || null);
        setStaffList(myStaff);
        if (self) {
          if ((self.role ?? '').toUpperCase() !== 'SHOPOWNER') {
            setUserCheckError(
              `Chỉ SHOPOWNER được tạo nhân viên qua trang này (hiện tại: ${self.role ?? '—'}).`
            );
          } else if (!self.shop_id) {
            setUserCheckError(
              'Bạn chưa có shop. Vui lòng đăng ký subscription trước khi tạo nhân viên.'
            );
          }
        }
      } else {
        // SHOPOWNER: dùng GET /users/managed để lấy danh sách nhân viên của mình
        setCurrentUser({
          user_id: uid,
          email: '',
          username: '',
          is_active: true,
          role: role || null,
          shop_id: shopId ? Number(shopId) : null,
          owner_manager_id: null,
          role_id: null,
          created_at: '',
          updated_at: '',
        });
        if (role !== 'SHOPOWNER') {
          setUserCheckError(
            'Trang này dành cho SHOPOWNER. Backend chỉ cho phép ADMIN xem danh sách user; SHOPOWNER có thể tạo tài khoản nhân viên qua nút "Tạo tài khoản".'
          );
          setStaffList([]);
        } else if (!shopId) {
          setUserCheckError(
            'Bạn chưa có shop. Vui lòng đăng ký subscription trước khi tạo nhân viên.'
          );
          setStaffList([]);
        } else {
          // SHOPOWNER hợp lệ: lấy danh sách nhân viên qua GET /users/managed
          try {
            const managed = await getManagedUsers();
            setStaffList(managed);
          } catch (err) {
            console.error('Error loading managed users:', err);
            setStaffList([]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      setLoadError(
        'Không thể tải dữ liệu. Kiểm tra kết nối và đăng nhập với quyền phù hợp.'
      );
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = () => {
    if (userCheckError) {
      setFormError(userCheckError);
      return;
    }
    setForm(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userCheckError) {
      setFormError(userCheckError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const result = await createManagedUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        role_code: form.role_code,
      });

      closeModal();
      setStaffList((prev) => [result, ...prev]);
      setSuccess('Tài khoản đã tạo. Thông tin đăng nhập đã được gửi đến email của người dùng.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (e: unknown) {
      const err = e as any;
      const errorMsg = getErrorMessage(e);

      console.error('Create managed user error:', {
        status: err?.status,
        message: err?.message,
        originalError: err?.originalError,
      });

      if (err?.status === 401) {
        setFormError(
          'Bạn không đủ quyền hoặc phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
        );
      } else if (err?.status === 400) {
        setFormError(`Lỗi: ${errorMsg}`);
      } else {
        setFormError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AppUser) => {
    setTogglingId(user.user_id);
    try {
      const updated = await updateUser(user.user_id, { is_active: !user.is_active });
      setStaffList((prev) => prev.map((u) => (u.user_id === user.user_id ? updated : u)));
      setSuccess(
        updated.is_active
          ? `Đã kích hoạt tài khoản "${updated.username}".`
          : `Đã vô hiệu hóa tài khoản "${updated.username}".`
      );
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setLoadError(`Cập nhật thất bại: ${msg}`);
      setTimeout(() => setLoadError(''), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý nhân viên</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách nhân viên thuộc cửa hàng của bạn. Thông tin đăng nhập khi tạo mới sẽ được gửi qua email.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={!!userCheckError}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition shadow-sm ${userCheckError
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          <UserPlus size={18} />
          Tạo tài khoản
        </button>
      </div>

      {userCheckError && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800"
        >
          <span className="text-red-500 text-xl">⚠️</span>
          <p className="text-sm font-medium">{userCheckError}</p>
        </div>
      )}

      {success && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800"
        >
          <span className="text-green-500 text-xl">✓</span>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : loadError ? (
          <div className="py-12 text-center text-red-500 text-sm">{loadError}</div>
        ) : staffList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Chưa có nhân viên nào. Bấm &quot;Tạo tài khoản&quot; để thêm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500 font-mono">#{u.user_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.username}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${(u.role ?? '').toUpperCase() === 'SHOPOWNER'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {u.role ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {u.is_active ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={togglingId === u.user_id}
                        onClick={() => handleToggleActive(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                          u.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        {togglingId === u.user_id
                          ? '...'
                          : u.is_active
                            ? 'Vô hiệu hóa'
                            : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tạo tài khoản */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Tạo tài khoản nhân viên</h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vai trò</label>
                <select
                  value={form.role_code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role_code: e.target.value as 'SHOPOWNER' | 'STAFF' }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="STAFF">Nhân viên (Staff)</option>
                  <option value="SHOPOWNER">Quản lý (Shopowner)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
