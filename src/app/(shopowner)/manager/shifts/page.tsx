"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CalendarClock,
  Users,
  X,
  Pencil,
  Check,
  Clock,
  ChevronDown,
  Copy,
  CheckCheck,
} from "lucide-react";
import {
  getShiftTemplates,
  createShiftTemplate,
  getShiftAssignments,
  assignShift,
  deleteShiftAssignment,
  updateShiftAssignment,
  type ShiftTemplate,
  type ShiftAssignment,
} from "@/apis/shiftApi";
import { getManagedUsers, type AppUser } from "@/apis/adminApi";
import { getStoredRoleNormalized } from "@/apis/auth";

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

function getErrorMsg(e: unknown): string {
  const err = e as { message?: string; response?: { data?: { message?: string | string[] } } };
  const backendMsg = err?.response?.data?.message;
  if (Array.isArray(backendMsg)) return backendMsg.join(", ");
  if (typeof backendMsg === "string") return backendMsg;
  return err?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTodayVnDateYmd(): string {
  // en-CA trả về dạng YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function ymdToIsoUtcNoon(ymd: string): string {
  // Parse YYYY-MM-DD safely and use UTC noon to minimize off-by-one date issues.
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString();
}

// ───────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────

export default function ShiftsPage() {
  const router = useRouter();

  const [role, setRole] = useState<string>(() => getStoredRoleNormalized());

  // ── Data state ──
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selfUser, setSelfUser] = useState<{ id: number; username: string } | null>(null);

  // ── Loading / Error ──
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Assign form ──
  const [formShiftId, setFormShiftId] = useState<number | "">("");
  const [formUserId, setFormUserId] = useState<number | "">("");
  const [formDateYmd, setFormDateYmd] = useState<string>(getTodayVnDateYmd());
  const [formNotes, setFormNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const minDateYmd = getTodayVnDateYmd();

  // ── New template inline ──
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // ── Delete confirm ──
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Edit notes ──
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // ── Filter ──
  const [filterUser, setFilterUser] = useState<number | "">("");
  const [filterShift, setFilterShift] = useState<number | "">("");

  // ── Copy ID ──
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id)).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ───────────────────────────────────────────────────────────────────
  // Load data
  // ───────────────────────────────────────────────────────────────────

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

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Lấy thông tin SHOPOWNER từ localStorage (được lưu khi đăng nhập)
      if (typeof window !== "undefined") {
        const storedId = Number(localStorage.getItem("userId"));
        const storedName = localStorage.getItem("username") ?? "Chủ shop";
        if (storedId) {
          setSelfUser({ id: storedId, username: storedName });
        }
      }

      const [assigns, tmplList, managed] = await Promise.all([
        getShiftAssignments(),
        getShiftTemplates(),
        getManagedUsers(),
      ]);
      setAssignments(assigns);
      setTemplates(tmplList);
      setUsers(managed);
    } catch (e) {
      setLoadError(getErrorMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ───────────────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────────────

  const handleAssign = async () => {
    if (!formShiftId || !formUserId || !formDateYmd) {
      setAssignError("Vui lòng chọn ca, người dùng và ngày.");
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      const result = await assignShift({
        shift_id: Number(formShiftId),
        user_id: Number(formUserId),
        date: ymdToIsoUtcNoon(formDateYmd),
        notes: formNotes.trim() || undefined,
      });
      setAssignments((prev) => [result, ...prev]);
      setFormShiftId("");
      setFormUserId("");
      setFormNotes("");
    } catch (e) {
      setAssignError(getErrorMsg(e));
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteShiftAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert(getErrorMsg(e));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    setCreatingTemplate(true);
    setTemplateError(null);
    try {
      const tmpl = await createShiftTemplate(newTemplateName.trim());
      setTemplates((prev) => [...prev, tmpl]);
      setNewTemplateName("");
      setShowNewTemplate(false);
      setFormShiftId(tmpl.id);
    } catch (e) {
      setTemplateError(getErrorMsg(e));
    } finally {
      setCreatingTemplate(false);
    }
  };

  const startEditNotes = (a: ShiftAssignment) => {
    setEditingId(a.id);
    setEditNotes(a.notes ?? "");
  };

  const handleSaveNotes = async (id: number) => {
    setSavingNotes(true);
    try {
      const updated = await updateShiftAssignment(id, editNotes);
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, notes: updated.notes } : a)),
      );
      setEditingId(null);
    } catch (e) {
      alert(getErrorMsg(e));
    } finally {
      setSavingNotes(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // Derived data
  // ───────────────────────────────────────────────────────────────────

  const allUserOptions: { id: number; label: string }[] = [
    ...(selfUser ? [{ id: selfUser.id, label: `${selfUser.username} (Tôi - Chủ shop)` }] : []),
    ...users.map((u) => ({ id: u.user_id, label: u.username })),
  ];

  const filtered = assignments.filter((a) => {
    if (filterUser !== "" && a.user_id !== Number(filterUser)) return false;
    if (filterShift !== "" && a.shift_id !== Number(filterShift)) return false;
    return true;
  });

  // Count by shift
  const countByShift = templates.map((t) => ({
    ...t,
    count: assignments.filter((a) => a.shift_id === t.id).length,
  }));

  // ───────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center gap-4 px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => router.push("/manager")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-blue-500" />
          <h1 className="text-base font-bold text-slate-800">Quản lý Ca làm việc</h1>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {assignments.length} ca đã phân
        </span>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-rose-400">
          <CalendarClock size={40} strokeWidth={1.2} />
          <p className="text-sm font-medium">{loadError}</p>
          <button
            type="button"
            onClick={loadAll}
            className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-0">

          {/* ══════════════════════════════════════════════════════
              LEFT — Danh sách phân ca
          ══════════════════════════════════════════════════════ */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-r border-slate-200">

            {/* Stats mini bar */}
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-100 overflow-x-auto">
              {countByShift.length === 0 ? (
                <span className="text-xs text-slate-400">Chưa có ca mẫu nào</span>
              ) : (
                countByShift.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 shrink-0"
                  >
                    <Clock size={12} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">{t.shift_name}</span>
                    <span className="text-xs text-blue-500 bg-blue-100 rounded-full px-1.5 py-0.5 font-mono">
                      {t.count}
                    </span>
                  </div>
                ))
              )}
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                <Users size={13} />
                <span>{new Set(assignments.map((a) => a.user_id)).size} người được phân</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Lọc:</span>
              <div className="relative">
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value === "" ? "" : Number(e.target.value))}
                  className="text-xs pl-2 pr-6 py-1.5 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-1 focus:ring-blue-300 outline-none"
                >
                  <option value="">Tất cả nhân viên</option>
                  {allUserOptions.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value === "" ? "" : Number(e.target.value))}
                  className="text-xs pl-2 pr-6 py-1.5 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-1 focus:ring-blue-300 outline-none"
                >
                  <option value="">Tất cả ca</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.shift_name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {(filterUser !== "" || filterShift !== "") && (
                <button
                  type="button"
                  onClick={() => { setFilterUser(""); setFilterShift(""); }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition"
                >
                  Xóa lọc
                </button>
              )}
              <span className="ml-auto text-xs text-slate-400">{filtered.length} kết quả</span>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-300">
                  <CalendarClock size={40} strokeWidth={1.2} />
                  <p className="text-sm font-medium">Chưa có phân ca nào</p>
                  <p className="text-xs">Dùng form bên phải để gán ca làm việc</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Mã ca (ID)
                        <span className="ml-1 text-[10px] text-slate-400 normal-case font-normal">← báo cho STAFF</span>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhân viên</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ca</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((a) => (
                      <tr
                        key={a.id}
                        className="bg-white hover:bg-slate-50 transition-colors"
                      >
                        {/* Mã ca nổi bật — SHOPOWNER báo cho STAFF */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-blue-600 font-mono">#{a.id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(a.id)}
                              title="Copy mã ca"
                              className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition"
                            >
                              {copiedId === a.id ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Nhân viên */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
                              {a.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{a.username}</p>
                              {selfUser && a.user_id === selfUser.id && (
                                <span className="text-[10px] text-blue-500 font-medium">Chủ shop</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Ca */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Clock size={10} />
                            {a.shift_name}
                          </span>
                        </td>

                        {/* Ghi chú */}
                        <td className="px-4 py-3 max-w-[200px]">
                          {editingId === a.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="text-xs px-2 py-1 border border-blue-300 rounded focus:ring-1 focus:ring-blue-400 outline-none flex-1 min-w-0"
                                placeholder="Ghi chú..."
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(a.id)}
                                disabled={savingNotes}
                                className="text-emerald-600 hover:text-emerald-700 transition disabled:opacity-50"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditNotes(a)}
                              className="group flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition w-full text-left"
                            >
                              <span className="truncate">{a.notes || <span className="text-slate-300 italic">Không có</span>}</span>
                              <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition" />
                            </button>
                          )}
                        </td>

                        {/* Ngày tạo */}
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(a.created_at)}
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id)}
                            disabled={deletingId === a.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition disabled:opacity-50"
                          >
                            {deletingId === a.id ? (
                              <div className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT — Phân ca mới + Quản lý ca mẫu
          ══════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[360px] shrink-0 flex flex-col overflow-y-auto bg-white border-t lg:border-t-0">

            {/* ── Phân ca mới ── */}
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={15} className="text-blue-500" />
                Phân ca mới
              </h2>

              <div className="flex flex-col gap-3">

                {/* Chọn ca */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Ca làm việc <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={formShiftId}
                        onChange={(e) => setFormShiftId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-sm pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                      >
                        <option value="">-- Chọn ca --</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.shift_name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowNewTemplate((v) => !v); setTemplateError(null); }}
                      title="Tạo ca mới"
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Inline tạo ca mẫu mới */}
                  {showNewTemplate && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-2">Tên ca mới</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCreateTemplate()}
                          placeholder="VD: Ca sáng, Ca chiều..."
                          className="flex-1 text-sm px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateTemplate}
                          disabled={creatingTemplate || !newTemplateName.trim()}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {creatingTemplate ? "..." : "Tạo"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNewTemplate(false); setTemplateError(null); setNewTemplateName(""); }}
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {templateError && (
                        <p className="text-xs text-rose-500 mt-1">{templateError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Chọn nhân viên */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Người dùng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formUserId}
                      onChange={(e) => setFormUserId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full text-sm pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {allUserOptions.map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Chọn ngày */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Ngày làm việc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDateYmd}
                    min={minDateYmd}
                    onChange={(e) => {
                      const next = e.target.value;
                      // YYYY-MM-DD so sánh chuỗi đúng thứ tự thời gian
                      if (next && next < minDateYmd) {
                        setFormDateYmd(minDateYmd);
                      } else {
                        setFormDateYmd(next);
                      }
                      setAssignError(null);
                    }}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  />
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Ghi chú <span className="text-slate-400">(tuỳ chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="VD: Thứ 2, 4, 6 — 7:00-15:00..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  />
                </div>

                {assignError && (
                  <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                    {assignError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning || !formShiftId || !formUserId || !formDateYmd}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gán...
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      Gán ca
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Danh sách ca mẫu ── */}
            <div className="p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Clock size={15} className="text-indigo-500" />
                Ca mẫu hiện có
              </h2>

              {templates.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-300">
                  <Clock size={28} strokeWidth={1.2} />
                  <p className="text-xs">Chưa có ca mẫu. Tạo ca mới ở trên.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {templates.map((t) => {
                    const count = assignments.filter((a) => a.shift_id === t.id).length;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span className="text-sm font-medium text-slate-700">{t.shift_name}</span>
                        </div>
                        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono">
                          {count} người
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
