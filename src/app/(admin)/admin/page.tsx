'use client'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { handleLogout, ROLE_CODE_ADMIN, getStoredRoleNormalized, isStoredRoleShopOwner } from '@/apis/auth'
import {
  getUsers, createUser, updateUser, assignAdminRole, createManagedUser,
  getSubscriptions, createSubscription,
  AdminUser, AppUser, SubscriptionPlan, CreateManagedUserDto,
} from '@/apis/adminApi'

type Tab = 'users' | 'tenants' | 'admins' | 'subscriptions'

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'users',         label: 'Quản lý User',         icon: '👤', color: 'blue' },
  { id: 'tenants',       label: 'Quản lý Shopowner',    icon: '🏢', color: 'indigo' },
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

const isAdminRole = (role: string | null | undefined) => (role ?? '').toUpperCase() === 'ADMIN'
/** User = account không có role (role_id null). Bảng role chỉ có ADMIN, SHOPOWNER, STAFF. */
const isUserAccount = (u: AppUser) => u.role_id == null
const isShopownerOrStaff = (role: string | null | undefined) => {
  const r = (role ?? '').toUpperCase()
  return r === 'SHOPOWNER' || r === 'STAFF'
}

// ============================================================
// TAB: USERS (chỉ hiển thị account có role_id null - user thường)
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

  const onlyUsers = users.filter(u => isUserAccount(u))
  const filtered = onlyUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách User</h2>
          <p className="text-sm text-gray-500">{onlyUsers.length} account </p>
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
              {/* <th className="px-4 py-3 text-left">Cửa hàng (shop_id)</th> */}
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
                    : <Badge text="user" color="gray" />}
                </td>
                {/* <td className="px-4 py-3 text-gray-500">{u.shop_id != null ? `#${u.shop_id}` : <span className="text-gray-300">—</span>}</td> */}
                <td className="px-4 py-3">
                  <Badge text={u.is_active ? 'Hoạt động' : 'Vô hiệu'} color={u.is_active ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TAB: SHOPOWNER (hiển thị account Shopowner và Staff của shopowner)
// Backend: tạo user qua POST /users/managed → gửi username/password qua email
// ============================================================
function TenantsTab() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showManagedForm, setShowManagedForm] = useState(false)
  const [managedSubmitting, setManagedSubmitting] = useState(false)
  const [managedFormError, setManagedFormError] = useState('')
  const [managedSuccess, setManagedSuccess] = useState('')
  const [managedForm, setManagedForm] = useState<CreateManagedUserDto & { confirmPassword: string }>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role_code: 'STAFF',
  })
  const [isShopOwner, setIsShopOwner] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setUsers(await getUsers()) }
    catch { setError('Không thể tải danh sách shopowner/staff') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setIsShopOwner(isStoredRoleShopOwner()) }, [])

  const getManagedErrorMessage = (e: unknown): string => {
    const err = e as { message?: string; response?: { data?: { message?: string | string[] } } }
    const msg = err?.message
    if (typeof msg === 'string' && msg.trim()) return msg
    const apiMsg = err?.response?.data?.message
    if (Array.isArray(apiMsg)) return apiMsg.join(', ')
    if (typeof apiMsg === 'string') return apiMsg
    return 'Đã xảy ra lỗi. Vui lòng thử lại.'
  }

  const handleCreateManaged = async (e: React.FormEvent) => {
    e.preventDefault()
    if (managedForm.password !== managedForm.confirmPassword) {
      setManagedFormError('Mật khẩu xác nhận không khớp.')
      return
    }
    setManagedSubmitting(true); setManagedFormError('')
    try {
      await createManagedUser({
        email: managedForm.email.trim(),
        username: managedForm.username.trim(),
        password: managedForm.password,
        role_code: managedForm.role_code,
      })
      setShowManagedForm(false)
      setManagedForm({ email: '', username: '', password: '', confirmPassword: '', role_code: 'STAFF' })
      await load()
      setManagedSuccess('Tài khoản đã tạo. Thông tin đăng nhập (username, mật khẩu) đã được gửi đến email của người dùng.')
      setTimeout(() => setManagedSuccess(''), 5000)
    } catch (e: unknown) {
      setManagedFormError(getManagedErrorMessage(e))
    } finally {
      setManagedSubmitting(false)
    }
  }

  const shopownerAndStaff = users.filter(u => isShopownerOrStaff(u.role))
  const filtered = shopownerAndStaff.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.profile?.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

  return (
    <div>
      {managedSuccess && (
        <div role="alert" className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <span className="text-green-500 text-xl">✓</span>
          <p className="text-sm font-medium">{managedSuccess}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách Shopowner & Staff</h2>
          <p className="text-sm text-gray-500">{shopownerAndStaff.length} account (Shopowner + Staff)</p>
        </div>
        <div className="flex items-center gap-3">
          {isShopOwner ? (
            <button
              type="button"
              onClick={() => { setShowManagedForm(true); setManagedFormError(''); setManagedForm({ email: '', username: '', password: '', confirmPassword: '', role_code: 'STAFF' }) }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Thêm nhân viên / Shopowner
            </button>
          ) : (
            <p className="text-sm text-gray-500 italic">Chỉ tài khoản SHOPOWNER mới có thể tạo nhân viên / Shopowner cho shop của mình.</p>
          )}
          <input
            type="text"
            placeholder="Tìm theo username, email, tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
          />
        </div>
      </div>
      {isShopOwner && showManagedForm && (
        <div className="mb-5 p-5 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Tạo tài khoản (thông tin đăng nhập sẽ gửi qua email)</h3>
          {managedFormError && (
            <p className="text-sm text-red-600 mb-3">{managedFormError}</p>
          )}
          <form onSubmit={handleCreateManaged} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={managedForm.email}
                onChange={e => setManagedForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
              <input
                type="text"
                required
                minLength={3}
                value={managedForm.username}
                onChange={e => setManagedForm(f => ({ ...f, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                minLength={6}
                value={managedForm.password}
                onChange={e => setManagedForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={managedForm.confirmPassword}
                onChange={e => setManagedForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              <select
                value={managedForm.role_code}
                onChange={e => setManagedForm(f => ({ ...f, role_code: e.target.value as 'SHOPOWNER' | 'STAFF' }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="STAFF">STAFF</option>
                <option value="SHOPOWNER">SHOPOWNER</option>
              </select>
              <button type="submit" disabled={managedSubmitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {managedSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
              <button type="button" onClick={() => setShowManagedForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Họ tên</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Cửa hàng (shop_id)</th>
              <th className="px-4 py-3 text-left">Chủ shop (owner_manager_id)</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <LoadingRow cols={9} /> :
             error   ? <ErrorRow cols={9} message={error} onRetry={load} /> :
             filtered.length === 0 ? <EmptyRow cols={9} message="Chưa có shopowner hoặc staff nào" /> :
             filtered.map(u => (
              <tr key={u.user_id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400 font-mono">#{u.user_id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.profile?.full_name ?? '—'}</td>
                <td className="px-4 py-3">
                  {u.role
                    ? <Badge text={u.role} color={u.role.toUpperCase() === 'SHOPOWNER' ? 'green' : 'blue'} />
                    : <Badge text="—" color="gray" />}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.shop_id != null ? `#${u.shop_id}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-gray-500">{u.owner_manager_id != null ? `#${u.owner_manager_id}` : <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3">
                  <Badge text={u.is_active ? 'Hoạt động' : 'Vô hiệu'} color={u.is_active ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TAB: ADMINS (chỉ hiển thị tài khoản có role admin)
// ============================================================
function AdminsTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ email: '', username: '', password: '', fullName: '', phone: '' })
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const mapUserToAdmin = (u: AppUser): AdminUser => ({
    adminId: u.user_id,
    email: u.email ?? '',
    fullName: u.profile?.full_name ?? u.username,
    phone: u.profile?.phone ?? null,
    isActive: u.is_active,
    lastLogin: u.last_login != null ? (typeof u.last_login === 'string' ? u.last_login : new Date(u.last_login).toISOString()) : null,
    createdAt: u.created_at,
  })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const users = await getUsers()
      const onlyAdmins = users.filter(u => isAdminRole(u.role))
      setAdmins(onlyAdmins.map(mapUserToAdmin))
    } catch {
      setError('Không thể tải danh sách admin')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const getErrorMessage = (e: unknown): string => {
    const err = e as {
      message?: string
      originalError?: { code?: string; message?: string; response?: { data?: { message?: string | string[] } } }
      response?: { data?: { message?: string | string[] } }
    }
    const msg = err?.message ?? err?.originalError?.message
    if (msg === 'Network Error' || err?.originalError?.code === 'ERR_NETWORK' || (typeof msg === 'string' && (msg.includes('CORS') || msg.includes('blocked')))) {
      return 'Không thể kết nối tới server. Backend (localhost:2999) cần cấu hình CORS cho phép method PATCH.'
    }
    if (typeof msg === 'string' && msg.trim()) return msg
    const data = err?.response?.data ?? err?.originalError?.response?.data
    const apiMsg = data?.message
    if (Array.isArray(apiMsg)) return apiMsg.join(', ')
    if (typeof apiMsg === 'string') return apiMsg
    return 'Đã xảy ra lỗi. Vui lòng thử lại.'
  }

  // Backend: POST /users (role_code: 'ADMIN') → PATCH /users/:id (full_name, phone). CORS phải cho phép PATCH.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setFormError('')
    try {
      const newUser = await createUser({
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        role_code: 'ADMIN',
      })
      // Cập nhật họ tên/SĐT (PATCH). Nếu PATCH lỗi (vd CORS) vẫn coi tạo admin thành công.
      if (form.fullName.trim() || form.phone?.trim()) {
        try {
          await updateUser(newUser.user_id, {
            full_name: form.fullName.trim() || undefined,
            phone: form.phone?.trim() || undefined,
          })
        } catch {
          // Bỏ qua: admin đã tạo, có thể cập nhật họ tên sau
        }
      }
      setShowForm(false)
      setForm({ email: '', username: '', password: '', fullName: '', phone: '' })
      await load()
      setSuccessMessage('Đã thêm Admin thành công!')
      setTimeout(() => setSuccessMessage(''), 3500)
    } catch (e: unknown) {
      setFormError(getErrorMessage(e) || 'Tạo admin thất bại. Kiểm tra kết nối hoặc thông tin đã nhập.')
    } finally {
      setSubmitting(false)
    }
  }

  // Backend: PATCH /users/:id với role_id: null → bỏ quyền admin (UserService.updateUser)
  const handleRemoveAdmin = async (id: number, email: string) => {
    if (!confirm(`Bỏ quyền Admin của "${email}"? Tài khoản vẫn tồn tại nhưng không còn là admin.`)) return
    setActioningId(id)
    setActionError(null)
    try {
      await updateUser(id, { role_id: null })
      setAdmins(prev => prev.filter(a => a.adminId !== id))
    } catch (e: unknown) {
      setActionError(getErrorMessage(e))
    } finally {
      setActioningId(null)
    }
  }

  // Backend: PATCH /users/:id với is_active → vô hiệu hóa/bật lại (UserService.updateUser)
  const handleToggle = async (id: number, current: boolean) => {
    setActioningId(id)
    setActionError(null)
    try {
      const updated = await updateUser(id, { is_active: !current })
      setAdmins(prev => prev.map(a => a.adminId === id ? { ...a, isActive: updated.is_active } : a))
    } catch (e: unknown) {
      setActionError(getErrorMessage(e))
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="relative">
      {successMessage && (
        <div role="alert" className="fixed top-24 right-6 z-[100] animate-[slideInRight_0.4s_ease-out]">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-green-500 text-white max-w-sm">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">✓</span>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      {actionError && (
        <div role="alert" className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
          <span className="flex-shrink-0 text-red-500 text-xl">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Lỗi thao tác</p>
            <p className="text-sm mt-0.5">{actionError}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition"
          >
            Đóng
          </button>
        </div>
      )}
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
          {formError && (
            <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <span className="flex-shrink-0">⚠️</span>
              <p>{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <input required type="email" placeholder="Email *" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input required type="text" placeholder="Username * (≥3 ký tự)" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} minLength={3}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input required type="password" placeholder="Mật khẩu * (≥6 ký tự)" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            <input type="text" placeholder="Họ tên" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            {/* <input type="text" placeholder="Số điện thoại" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" /> */}
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
        <th className="px-4 py-3 text-left">Trạng thái</th>
        <th className="px-4 py-3 text-center">Ngày Tạo</th>
        <th className="px-4 py-3 text-center">Thao tác</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {loading ? (
        <LoadingRow cols={6} />
      ) : error ? (
        <ErrorRow cols={6} message={error} onRetry={load} />
      ) : admins.length === 0 ? (
        <EmptyRow cols={6} message="Chưa có admin nào" />
      ) : (
        admins.map((a) => (
          <tr key={a.adminId} className="hover:bg-gray-50 transition">
            <td className="px-4 py-3 text-gray-400 font-mono">
              #{a.adminId}
            </td>

            <td className="px-4 py-3 font-medium text-gray-900">
              {a.fullName}
            </td>

            <td className="px-4 py-3 text-gray-600">
              {a.email}
            </td>

            <td className="px-4 py-3">
              <Badge
                text={a.isActive ? 'Hoạt động' : 'Vô hiệu'}
                color={a.isActive ? 'green' : 'red'}
              />
            </td>

            {/* Ngày tạo căn giữa */}
            <td className="px-4 py-3 text-gray-500 text-center">
              {new Date(a.createdAt).toLocaleString('vi-VN')}
            </td>

            {/* Thao tác căn giữa đúng cách */}
            <td className="px-4 py-3">
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={actioningId === a.adminId}
                  onClick={() =>
                    handleToggle(a.adminId, a.isActive)
                  }
                  className={`text-xs px-3 py-1 rounded-lg transition 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  ${
                    a.isActive
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {actioningId === a.adminId
                    ? 'Đang xử lý...'
                    : a.isActive
                    ? 'Vô hiệu'
                    : 'Kích hoạt'}
                </button>

                <button
                  type="button"
                  disabled={actioningId === a.adminId}
                  onClick={() =>
                    handleRemoveAdmin(a.adminId, a.email)
                  }
                  className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actioningId === a.adminId
                    ? 'Đang xử lý...'
                    : 'Bỏ quyền Admin'}
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
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
    if (!token || role !== 'ADMIN') { router.replace('/auth?mode=login'); return }
    setAdminEmail(localStorage.getItem('username') || '')

    // Load counts: User (role USER), Shopowner+Staff (role SHOPOWNER/STAFF), Admin, Subscriptions
    Promise.allSettled([getUsers(), getSubscriptions()]).then(results => {
      const usersList = results[0].status === 'fulfilled' ? results[0].value : []
      const userCount = Array.isArray(usersList) ? usersList.filter((u: AppUser) => isUserAccount(u)).length : 0
      const shopownerStaffCount = Array.isArray(usersList) ? usersList.filter((u: AppUser) => isShopownerOrStaff(u.role)).length : 0
      const adminCount = Array.isArray(usersList) ? usersList.filter((u: AppUser) => isAdminRole(u.role)).length : 0
      setStats({
        users:         userCount,
        tenants:       shopownerStaffCount,
        admins:        adminCount,
        subscriptions: results[1].status === 'fulfilled' ? results[1].value.length : 0,
      })
    })
  }, [router])

  if (!mounted) return null

  const STAT_CARDS = [
    { label: 'Tổng User',         value: stats.users,         icon: '👤', bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-600',   tab: 'users' as Tab },
    { label: 'Shopowner & Staff', value: stats.tenants,       icon: '🏢', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', tab: 'tenants' as Tab },
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
