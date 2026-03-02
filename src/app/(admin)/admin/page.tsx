'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { handleLogout } from '@/apis/auth'
import {
  getAdmins, createAdmin, deleteAdmin, toggleAdminStatus,
  getUsers,
  getTenants, deleteTenant,
  getSubscriptions, createSubscription,
  AdminUser, AppUser, Tenant, SubscriptionPlan,
} from '@/apis/adminApi'

type Tab = 'users' | 'tenants' | 'admins' | 'subscriptions'

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'users',         label: 'Quản lý User',         icon: '👤', color: 'blue' },
  { id: 'tenants',       label: 'Quản lý Tenant',       icon: '🏢', color: 'indigo' },
  { id: 'admins',        label: 'Quản lý Admin',        icon: '👑', color: 'purple' },
  { id: 'subscriptions', label: 'Quản lý Subscription', icon: '📦', color: 'green' },
]

function Badge({ text, color }: { text: string; color: string }) {
  const map: Record<string, string> = {
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-600',
    blue:   'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gray:   'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[color] ?? map.gray}`}>
      {text}
    </span>
  )
}

function LoadingRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-gray-400">
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </td>
    </tr>
  )
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-gray-400 text-sm">{message}</td>
    </tr>
  )
}

function ErrorRow({ cols, message, onRetry }: { cols: number; message: string; onRetry: () => void }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center">
        <p className="text-red-500 text-sm mb-2">{message}</p>
        <button onClick={onRetry} className="text-sm text-blue-600 hover:underline">Thử lại</button>
      </td>
    </tr>
  )
}

// ============================================================
// TAB: USERS
// ============================================================
function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setUsers(await getUsers()) }
    catch { setError('Không thể tải danh sách user') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách User</h2>
          <p className="text-sm text-gray-500">{users.length} tài khoản trong hệ thống</p>
        </div>
        <input
          type="text"
          placeholder="Tìm theo username, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <LoadingRow cols={7} /> :
             error   ? <ErrorRow cols={7} message={error} onRetry={load} /> :
             filtered.length === 0 ? <EmptyRow cols={7} message="Không có user nào" /> :
             filtered.map(u => (
              <tr key={u.user_id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400 font-mono">#{u.user_id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role
                    ? <Badge text={u.role} color={u.role === 'SHOPOWNER' ? 'green' : 'blue'} />
                    : <Badge text="Chưa có gói" color="gray" />}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.tenantId ? `#${u.tenantId}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  <Badge text={u.isActive ? 'Hoạt động' : 'Vô hiệu'} color={u.isActive ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TAB: TENANTS
// ============================================================
function TenantsTab() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setTenants(await getTenants()) }
    catch { setError('Không thể tải danh sách tenant') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa tenant "${name}"? Hành động này không thể hoàn tác.`)) return
    setDeletingId(id)
    try { await deleteTenant(id); setTenants(prev => prev.filter(t => t.tenant_id !== id)) }
    catch (e: unknown) { alert((e as { message?: string })?.message || 'Xóa thất bại') }
    finally { setDeletingId(null) }
  }

  const filtered = tenants.filter(t =>
    t.tenant_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách Tenant</h2>
          <p className="text-sm text-gray-500">{tenants.length} cửa hàng trong hệ thống</p>
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Tên cửa hàng</th>
              <th className="px-4 py-3 text-left">Admin ID</th>
              <th className="px-4 py-3 text-left">Điểm loyalty</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <LoadingRow cols={7} /> :
             error   ? <ErrorRow cols={7} message={error} onRetry={load} /> :
             filtered.length === 0 ? <EmptyRow cols={7} message="Chưa có tenant nào" /> :
             filtered.map(t => (
              <tr key={t.tenant_id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400 font-mono">#{t.tenant_id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.tenant_name}</td>
                <td className="px-4 py-3 text-gray-500">Admin #{t.admin_id}</td>
                <td className="px-4 py-3 text-gray-600">{t.loyal_point_per_unit ?? 0} pt/đv</td>
                <td className="px-4 py-3">
                  <Badge text={t.is_active ? 'Hoạt động' : 'Tạm dừng'} color={t.is_active ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(t.tenant_id, t.tenant_name)}
                    disabled={deletingId === t.tenant_id}
                    className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {deletingId === t.tenant_id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TAB: ADMINS
// ============================================================
function AdminsTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setAdmins(await getAdmins()) }
    catch { setError('Không thể tải danh sách admin') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const newAdmin = await createAdmin({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || undefined,
      })
      setAdmins(prev => [...prev, newAdmin])
      setShowForm(false)
      setForm({ email: '', password: '', fullName: '', phone: '' })
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message || 'Tạo admin thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Xóa admin "${email}"?`)) return
    try { await deleteAdmin(id); setAdmins(prev => prev.filter(a => a.adminId !== id)) }
    catch (e: unknown) { alert((e as { message?: string })?.message || 'Xóa thất bại') }
  }

  const handleToggle = async (id: number, current: boolean) => {
    try {
      const updated = await toggleAdminStatus(id, !current)
      setAdmins(prev => prev.map(a => a.adminId === id ? { ...a, isActive: updated.isActive } : a))
    } catch (e: unknown) { alert((e as { message?: string })?.message || 'Cập nhật thất bại') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách Admin</h2>
          <p className="text-sm text-gray-500">{admins.length} quản trị viên</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
        >
          <span>+</span> Thêm Admin
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 bg-purple-50 border border-purple-100 rounded-2xl space-y-3">
          <h3 className="font-semibold text-purple-800 mb-1">Tạo tài khoản Admin mới</h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input required type="email" placeholder="Email *" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input required type="password" placeholder="Mật khẩu * (≥6 ký tự)" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input required type="text" placeholder="Họ tên *" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input type="text" placeholder="Số điện thoại" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50">
              {submitting ? 'Đang tạo...' : 'Tạo Admin'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Họ tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">SĐT</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Đăng nhập lần cuối</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <LoadingRow cols={7} /> :
             error   ? <ErrorRow cols={7} message={error} onRetry={load} /> :
             admins.length === 0 ? <EmptyRow cols={7} message="Chưa có admin nào" /> :
             admins.map(a => (
              <tr key={a.adminId} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400 font-mono">#{a.adminId}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{a.email}</td>
                <td className="px-4 py-3 text-gray-500">{a.phone || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  <Badge text={a.isActive ? 'Hoạt động' : 'Vô hiệu'} color={a.isActive ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {a.lastLogin ? new Date(a.lastLogin).toLocaleString('vi-VN') : <span className="text-gray-300">Chưa đăng nhập</span>}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleToggle(a.adminId, a.isActive)}
                    className={`text-xs px-3 py-1 rounded-lg transition ${a.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {a.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                  </button>
                  <button onClick={() => handleDelete(a.adminId, a.email)}
                    className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TAB: SUBSCRIPTIONS
// ============================================================
function SubscriptionsTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    packageCode: '', description: '', price: '', billingCycle: 'MONTHLY',
  })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setPlans(await getSubscriptions()) }
    catch { setError('Không thể tải danh sách subscription') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const created = await createSubscription({
        packageCode: form.packageCode.toUpperCase(),
        description: form.description || undefined,
        price: Number(form.price),
        billingCycle: form.billingCycle,
      })
      setPlans(prev => [...prev, created])
      setShowForm(false)
      setForm({ packageCode: '', description: '', price: '', billingCycle: 'MONTHLY' })
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message || 'Tạo gói thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const CYCLE_LABEL: Record<string, string> = { MONTHLY: 'Hàng tháng', YEARLY: 'Hàng năm', ONCE: 'Một lần' }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách gói Subscription</h2>
          <p className="text-sm text-gray-500">{plans.length} gói dịch vụ</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
        >
          <span>+</span> Thêm gói
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 bg-green-50 border border-green-100 rounded-2xl space-y-3">
          <h3 className="font-semibold text-green-800 mb-1">Tạo gói subscription mới</h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input required type="text" placeholder="Mã gói (VD: BASIC, PRO) *" value={form.packageCode}
              onChange={e => setForm(f => ({ ...f, packageCode: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 uppercase" />
            <input required type="number" placeholder="Giá (VNĐ) *" value={form.price} min={0}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            <input type="text" placeholder="Mô tả" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
            <select value={form.billingCycle} onChange={e => setForm(f => ({ ...f, billingCycle: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white">
              <option value="MONTHLY">Hàng tháng</option>
              <option value="YEARLY">Hàng năm</option>
              <option value="ONCE">Một lần</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50">
              {submitting ? 'Đang tạo...' : 'Tạo gói'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Mã gói</th>
              <th className="px-4 py-3 text-left">Mô tả</th>
              <th className="px-4 py-3 text-left">Giá</th>
              <th className="px-4 py-3 text-left">Chu kỳ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <LoadingRow cols={5} /> :
             error   ? <ErrorRow cols={5} message={error} onRetry={load} /> :
             plans.length === 0 ? <EmptyRow cols={5} message="Chưa có gói nào. Hãy tạo gói đầu tiên!" /> :
             plans.map(p => (
              <tr key={p.subscription_id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400 font-mono">#{p.subscription_id}</td>
                <td className="px-4 py-3">
                  <Badge text={p.package_code} color="green" />
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.description || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {p.price.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-4 py-3">
                  <Badge text={CYCLE_LABEL[p.billing_cycle] ?? p.billing_cycle} color="blue" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState('')
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [stats, setStats] = useState({ users: 0, tenants: 0, admins: 0, subscriptions: 0 })

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('role')
    if (!token || role !== 'admin') { router.replace('/auth?mode=login'); return }
    setAdminEmail(localStorage.getItem('username') || '')

    // Load counts
    Promise.allSettled([getUsers(), getTenants(), getAdmins(), getSubscriptions()]).then(results => {
      setStats({
        users:         results[0].status === 'fulfilled' ? results[0].value.length : 0,
        tenants:       results[1].status === 'fulfilled' ? results[1].value.length : 0,
        admins:        results[2].status === 'fulfilled' ? results[2].value.length : 0,
        subscriptions: results[3].status === 'fulfilled' ? results[3].value.length : 0,
      })
    })
  }, [router])

  if (!mounted) return null

  const STAT_CARDS = [
    { label: 'Tổng User',         value: stats.users,         icon: '👤', bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-600',   tab: 'users' as Tab },
    { label: 'Tổng Tenant',       value: stats.tenants,       icon: '🏢', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', tab: 'tenants' as Tab },
    { label: 'Tổng Admin',        value: stats.admins,        icon: '👑', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-600', tab: 'admins' as Tab },
    { label: 'Gói Subscription',  value: stats.subscriptions, icon: '📦', bg: 'bg-green-50 border-green-200',  text: 'text-green-600',  tab: 'subscriptions' as Tab },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-40">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">MA</span>
            </div>
            <span className="font-bold text-gray-800 text-sm">ManageApp</span>
          </Link>
        </div>

        <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/75">Quản trị viên</p>
              <p className="text-sm font-bold truncate">{adminEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <Link href="/"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
              <span>🌐</span> Trang chủ
            </Link>
          </div>
        </nav>

        <div className="px-3 pb-5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Chào mừng, {adminEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">👑 Admin</span>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-xs font-medium">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(s => (
              <button key={s.label} onClick={() => setActiveTab(s.tab)}
                className={`${s.bg} border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition text-left w-full`}>
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Tab headers */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-1 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'users'         && <UsersTab />}
              {activeTab === 'tenants'       && <TenantsTab />}
              {activeTab === 'admins'        && <AdminsTab />}
              {activeTab === 'subscriptions' && <SubscriptionsTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
