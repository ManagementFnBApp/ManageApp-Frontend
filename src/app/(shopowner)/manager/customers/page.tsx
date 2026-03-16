'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateLoyaltyPoints,
  type Customer,
  type CreateCustomerPayload,
} from '@/apis/customerApi';
import { getStoredRoleNormalized } from '@/apis/auth';
import { UserPlus, Pencil, Trash2, Gift } from 'lucide-react';

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : '—';

export default function ManagerCustomersPage() {
  const router = useRouter();

  // Chỉ cho phép SHOPOWNER và STAFF truy cập trang này
  useEffect(() => {
    const currentRole = getStoredRoleNormalized();
    if (currentRole !== 'SHOPOWNER' && currentRole !== 'STAFF') {
      router.replace('/manager');
    }
  }, [router]);

  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'points' | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState({ phone: '', full_name: '', loyalty_point: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isStaff = role === 'STAFF';
  const isShopOwner = role === 'SHOPOWNER';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setList(data);
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRole(getStoredRoleNormalized());
    load();
  }, [load]);

  const shopId = typeof window !== 'undefined' ? Number(localStorage.getItem('shopId') || 0) : 0;

  const openAdd = () => {
    setForm({ phone: '', full_name: '', loyalty_point: 0 });
    setFormError('');
    setSelected(null);
    setModal('add');
  };

  const openEdit = (c: Customer) => {
    setSelected(c);
    setForm({
      phone: c.phone,
      full_name: c.full_name ?? '',
      loyalty_point: c.loyalty_point,
    });
    setFormError('');
    setModal('edit');
  };

  const openPoints = (c: Customer) => {
    setSelected(c);
    setForm({ phone: c.phone, full_name: c.full_name ?? '', loyalty_point: c.loyalty_point });
    setFormError('');
    setModal('points');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setFormError('Số điện thoại không được trống.');
      return;
    }
    if (!shopId) {
      setFormError('Bạn chưa có shop. Vui lòng đăng nhập lại sau khi đăng ký gói.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await createCustomer({
        shop_id: shopId,
        phone: form.phone.trim(),
        full_name: form.full_name.trim() || undefined,
        loyalty_point: form.loyalty_point || undefined,
      });
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(e?.message ?? e?.response?.data?.message ?? 'Tạo khách hàng thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.phone.trim()) {
      setFormError('Số điện thoại không được trống.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await updateCustomer(selected.id, {
        phone: form.phone.trim(),
        full_name: form.full_name.trim() || undefined,
        loyalty_point: form.loyalty_point,
      });
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(e?.message ?? e?.response?.data?.message ?? 'Cập nhật thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setFormError('');
    try {
      await updateLoyaltyPoints(selected.id, form.loyalty_point);
      closeModal();
      await load();
    } catch (e: any) {
      setFormError(e?.message ?? e?.response?.data?.message ?? 'Cập nhật điểm thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`Xóa khách hàng ${c.full_name || c.phone}?`)) return;
    try {
      await deleteCustomer(c.id);
      await load();
    } catch (e: any) {
      alert(e?.message ?? 'Xóa thất bại.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách khách hàng của cửa hàng. Nhân viên có thể thêm/sửa và cập nhật điểm thưởng.
          </p>
        </div>
        {isStaff && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <UserPlus size={18} />
            Thêm khách hàng
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={load} className="underline">Thử lại</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Chưa có khách hàng nào.
            {isStaff && ' Bấm "Thêm khách hàng" để thêm.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">SĐT</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-right">Điểm thưởng</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500 font-mono">#{c.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{c.full_name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{c.loyalty_point}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {isStaff && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                              title="Sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openPoints(c)}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"
                              title="Điểm thưởng"
                            >
                              <Gift size={16} />
                            </button>
                          </>
                        )}
                        {isShopOwner && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm */}
      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Thêm khách hàng</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Điểm thưởng</label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) => setForm((f) => ({ ...f, loyalty_point: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Đang tạo...' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {modal === 'edit' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Sửa khách hàng</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Điểm thưởng</label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) => setForm((f) => ({ ...f, loyalty_point: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Điểm thưởng */}
      {modal === 'points' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Cập nhật điểm thưởng — {selected.full_name || selected.phone}</h2>
            <form onSubmit={handleUpdatePoints} className="space-y-4">
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Điểm thưởng</label>
                <input
                  type="number"
                  min={0}
                  value={form.loyalty_point}
                  onChange={(e) => setForm((f) => ({ ...f, loyalty_point: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
