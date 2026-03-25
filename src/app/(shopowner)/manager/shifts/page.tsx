"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import {
  ConfirmDeleteModal,
  ToastMessage,
  type ToastType,
} from "../inventory/inventoryComponent";

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

function getErrorMsg(e: unknown): string {
  const err = e as {
    message?: string;
    response?: { data?: { message?: string | string[] } };
  };
  const backendMsg = err?.response?.data?.message;
  if (Array.isArray(backendMsg)) return backendMsg.join(", ");
  if (typeof backendMsg === "string") return backendMsg;
  return err?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
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

const TIMETABLE_SLOT_COUNT = 4;
const DAY_HEADERS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const SLOT_LABELS_VI = ["Sáng", "Trưa", "Chiều", "Tối"];

function stripVietnameseDiacritics(input: string): string {
  // "Sáng" -> "Sang" để match keyword ổn định dù dữ liệu có dấu/không dấu.
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getSlotLabel(tmpl: ShiftTemplate | null, slotIdx: number): string {
  if (!tmpl) return SLOT_LABELS_VI[slotIdx] ?? `Slot ${slotIdx + 1}`;
  const name = stripVietnameseDiacritics(tmpl.shift_name).toLowerCase();

  if (name.includes("sang")) return "Sáng";
  if (name.includes("trua")) return "Trưa";
  if (name.includes("chieu")) return "Chiều";
  if (name.includes("toi")) return "Tối";

  // Fallback: nếu shift_name không theo chuẩn từ khóa trên.
  return tmpl.shift_name;
}

function parseYmdUtcNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!y || !m || !d) return new Date();
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function formatYmdUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Thứ Hai của tuần chứa ngày YYYY-MM-DD (theo cùng quy ước UTC noon). */
function startOfWeekMondayYmd(ymd: string): string {
  const d = parseYmdUtcNoon(ymd);
  const dow = d.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + offset);
  return formatYmdUtc(d);
}

function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmdUtcNoon(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return formatYmdUtc(d);
}

function formatDdMm(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}`;
}

/** Chuẩn hóa ngày phân ca để khớp ô lưới (ưu tiên prefix YYYY-MM-DD). */
function assignmentDateYmd(a: ShiftAssignment): string {
  const raw = a.date;
  if (!raw) return "";
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(raw));
  } catch {
    return "";
  }
}

function compareYmd(a: string, b: string): number {
  return a.localeCompare(b);
}

function shiftStatusLabel(ymd: string): { text: string; className: string } {
  const today = getTodayVnDateYmd();
  const c = compareYmd(ymd, today);
  if (c < 0)
    return { text: "(Đã qua)", className: "text-emerald-600" };
  if (c === 0)
    return { text: "(Hôm nay)", className: "text-sky-600" };
  return { text: "(Sắp tới)", className: "text-amber-600" };
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
  const [selfUser, setSelfUser] = useState<{
    id: number;
    username: string;
  } | null>(null);

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

  // ── Shift details modal ──
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsAssignment, setDetailsAssignment] = useState<ShiftAssignment | null>(
    null,
  );

  // ── Confirm delete modal ──
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ── Toast (dùng chung component với các trang manager khác) ──
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(
    null,
  );

  // ── Tuần hiển thị (lưới timetable) ──
  const [weekStartYmd, setWeekStartYmd] = useState(() =>
    startOfWeekMondayYmd(getTodayVnDateYmd()),
  );

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id)).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  const openShiftDetails = (a: ShiftAssignment) => {
    setDetailsAssignment(a);
    startEditNotes(a);
    setDetailsOpen(true);
  };

  const closeShiftDetails = () => {
    setDetailsOpen(false);
    setDetailsAssignment(null);
    setEditingId(null);
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

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
      setWeekStartYmd(startOfWeekMondayYmd(formDateYmd));
      setFormShiftId("");
      setFormUserId("");
      setFormNotes("");
    } catch (e) {
      setAssignError(getErrorMsg(e));
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (
    id: number,
  ): Promise<{ ok: boolean; message: string }> => {
    setDeletingId(id);
    try {
      const msg = await deleteShiftAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      return { ok: true, message: msg };
    } catch (e) {
      return { ok: false, message: getErrorMsg(e) };
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

  const handleSaveNotes = async (id: number): Promise<boolean> => {
    setSavingNotes(true);
    try {
      const updated = await updateShiftAssignment(id, editNotes);
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, notes: updated.notes } : a)),
      );
      setEditingId(null);
      return true;
    } catch (e) {
      alert(getErrorMsg(e));
      return false;
    } finally {
      setSavingNotes(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // Derived data
  // ───────────────────────────────────────────────────────────────────

  const allUserOptions: { id: number; label: string }[] = [
    ...(selfUser
      ? [{ id: selfUser.id, label: `${selfUser.username} (Tôi - Chủ shop)` }]
      : []),
    ...users.map((u) => ({ id: u.user_id, label: u.username })),
  ];

  const filtered = assignments.filter((a) => {
    if (filterUser !== "" && a.user_id !== Number(filterUser)) return false;
    if (filterShift !== "" && a.shift_id !== Number(filterShift)) return false;
    return true;
  });

  const weekDayYmds = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysYmd(weekStartYmd, i)),
    [weekStartYmd],
  );

  const slotTemplates = useMemo((): (ShiftTemplate | null)[] => {
    const sorted = [...templates].sort((a, b) => a.id - b.id);
    return Array.from(
      { length: TIMETABLE_SLOT_COUNT },
      (_, i) => sorted[i] ?? null,
    );
  }, [templates]);

  const slotTemplateIds = useMemo(
    () =>
      new Set(
        slotTemplates.filter((t): t is ShiftTemplate => t != null).map((t) => t.id),
      ),
    [slotTemplates],
  );

  const assignmentsOutsideTimetableSlots = useMemo(
    () => filtered.filter((a) => !slotTemplateIds.has(a.shift_id)),
    [filtered, slotTemplateIds],
  );

  const goPrevWeek = () =>
    setWeekStartYmd((w) => addDaysYmd(w, -7));
  const goNextWeek = () =>
    setWeekStartYmd((w) => addDaysYmd(w, 7));
  const goThisWeek = () =>
    setWeekStartYmd(startOfWeekMondayYmd(getTodayVnDateYmd()));

  const todayYmdForGrid = getTodayVnDateYmd();

  // Count by shift
  const countByShift = templates.map((t) => ({
    ...t,
    count: assignments.filter((a) => a.shift_id === t.id).length,
  }));

  const detailsYmd = detailsAssignment ? assignmentDateYmd(detailsAssignment) : "";
  const detailsStatus = detailsYmd ? shiftStatusLabel(detailsYmd) : null;

  // ───────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {toast ? (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
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
        <div className="flex-1 flex flex-col gap-0">
          <div className="flex flex-col lg:flex-row gap-0">
          {/* ══════════════════════════════════════════════════════
              LEFT — Lịch tuần (timetable)
          ══════════════════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col border-r border-slate-200">

            {/* Stats mini bar */}
            <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-6 py-3 bg-white border-b border-slate-100">
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
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
                <Users size={13} />
                <span>{new Set(assignments.map((a) => a.user_id)).size} người được phân</span>
              </div>
            </div>

            {/* Tuần + thời khóa biểu (7 hàng ngày × 4 cột ca) */}
            <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-6 py-2.5 bg-white border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Tuần làm việc</span>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={goPrevWeek}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 transition"
                  title="Tuần trước"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[10rem] text-center text-xs font-medium text-slate-700 px-1">
                  {formatDdMm(weekDayYmds[0])} – {formatDdMm(weekDayYmds[6])}
                </span>
                <button
                  type="button"
                  onClick={goNextWeek}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 transition"
                  title="Tuần sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={goThisWeek}
                className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                Tuần này
              </button>
              
            </div>

            <div className="bg-slate-100/60">
              <div className="p-4">
                <table className="w-full table-fixed border-collapse border border-slate-300 bg-white text-sm shadow-sm">
                  <thead>
                    <tr>
                      <th
                        className="w-24 border-b border-r border-slate-300 bg-[#5f88ce] px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-white"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Year</span>
                          <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono">
                            {parseYmdUtcNoon(weekDayYmds[0]).getUTCFullYear()}
                          </span>
                        </div>
                      </th>
                      {weekDayYmds.map((ymd, i) => {
                        const isToday = compareYmd(ymd, todayYmdForGrid) === 0;
                        return (
                        <th
                            key={ymd}
                            className={`border-b border-slate-300 px-1.5 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider ${
                              isToday
                                ? "bg-[#3f71c5] text-white"
                                : "bg-[#5f88ce] text-white"
                            }`}
                        >
                            {DAY_HEADERS_VI[i]}
                        </th>
                        );
                      })}
                    </tr>
                    <tr>
                      <th className="border-r border-slate-300 bg-[#5f88ce] px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-white">
                        WEEK
                        <div className="font-normal">
                          {formatDdMm(weekDayYmds[0])} - {formatDdMm(weekDayYmds[6])}
                        </div>
                      </th>
                      {weekDayYmds.map((ymd) => {
                        const isToday = compareYmd(ymd, todayYmdForGrid) === 0;
                        return (
                          <th
                            key={`sub-${ymd}`}
                            className={`border-b border-slate-300 px-1.5 py-1 text-center text-[11px] font-semibold ${
                              isToday
                                ? "bg-[#4a79c7] text-white"
                                : "bg-[#79a0dc] text-slate-900"
                            }`}
                          >
                            {formatDdMm(ymd)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {slotTemplates.map((tmpl, slotIdx) => {
                      return (
                        <tr
                          key={slotIdx}
                          className="border-b border-slate-200 last:border-b-0"
                        >
                          <td
                            className="border-r border-slate-200 bg-white px-2 py-2 align-top text-xs"
                          >
                            <p className="font-semibold text-slate-700">
                              {getSlotLabel(tmpl, slotIdx)}
                            </p>
                          </td>
                          {weekDayYmds.map((dayYmd) => {
                            const isTodayCol = compareYmd(dayYmd, todayYmdForGrid) === 0;
                            const list =
                              tmpl != null
                                ? filtered.filter(
                                    (a) =>
                                      assignmentDateYmd(a) === dayYmd &&
                                      a.shift_id === tmpl.id,
                                  )
                                : [];
                            return (
                              <td
                                key={`${slotIdx}-${dayYmd}`}
                                className={`align-top border-l border-slate-100 p-1 ${
                                  isTodayCol ? "bg-sky-50/60" : "bg-white"
                                }`}
                              >
                                {list.length === 0 ? (
                                  <button
                                    type="button"
                                    disabled={!tmpl}
                                    onClick={() => {
                                      setFormDateYmd(dayYmd);
                                      if (tmpl) setFormShiftId(tmpl.id);
                                      setAssignError(null);
                                    }}
                                    className="flex min-h-[60px] w-full items-center justify-center rounded text-base text-slate-300 transition hover:bg-slate-50 hover:text-slate-500 disabled:cursor-default disabled:hover:bg-transparent"
                                  >
                                    —
                                  </button>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    {list.map((a) => {
                                      const st = shiftStatusLabel(dayYmd);
                                      return (
                                        <div
                                          key={a.id}
                                          className="rounded border border-slate-200 bg-white p-1.5"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                                                {a.username.charAt(0).toUpperCase()}
                                              </span>
                                              <span className="min-w-0 truncate text-xs font-semibold text-slate-700">
                                                {a.username}
                                                {selfUser &&
                                                a.user_id === selfUser.id ? (
                                                  <span className="ml-1 text-[9px] text-blue-500">
                                                    (Chủ shop)
                                                  </span>
                                                ) : null}
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => openShiftDetails(a)}
                                              className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                                            >
                                              Chi tiết
                                            </button>
                                          </div>
                                          <div className="mt-1 flex items-center justify-between gap-2">
                                            <span className="font-mono text-[10px] font-bold text-blue-500">
                                              #{a.id}
                                            </span>
                                            <span
                                              className={`text-[10px] font-semibold ${st.className}`}
                                            >
                                              {st.text}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {assignments.length === 0 ? (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Chưa có phân ca nào — dùng form bên phải để gán.
                  </p>
                ) : null}
                {assignmentsOutsideTimetableSlots.length > 0 ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-800">
                    Có {assignmentsOutsideTimetableSlots.length} phân ca thuộc ca
                    mẫu ngoài 4 hàng đầu — không hiện trên lưới. Dùng lọc
                    &quot;Ca&quot; phía trên hoặc gom ca mẫu vào 4 ID nhỏ nhất.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT — Phân ca mới + Quản lý ca mẫu
          ══════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[360px] shrink-0 flex flex-col bg-white border-t lg:border-t-0">
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
                        onChange={(e) =>
                          setFormShiftId(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-full text-sm pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                      >
                        <option value="">-- Chọn ca --</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.shift_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTemplate((v) => !v);
                        setTemplateError(null);
                      }}
                      title="Tạo ca mới"
                      className="px-2.5 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Inline tạo ca mẫu mới */}
                  {showNewTemplate && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-2">
                        Tên ca mới
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleCreateTemplate()
                          }
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
                          onClick={() => {
                            setShowNewTemplate(false);
                            setTemplateError(null);
                            setNewTemplateName("");
                          }}
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {templateError && (
                        <p className="text-xs text-rose-500 mt-1">
                          {templateError}
                        </p>
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
                      onChange={(e) =>
                        setFormUserId(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full text-sm pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                    >
                      <option value="">-- Chọn người dùng --</option>
                      {allUserOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
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
                  disabled={
                    assigning || !formShiftId || !formUserId || !formDateYmd
                  }
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
                    const count = assignments.filter(
                      (a) => a.shift_id === t.id,
                    ).length;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {t.shift_name}
                          </span>
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

        {/* Filters (đưa xuống dưới phần chia 2 cột) */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-6 py-2.5 bg-slate-50 border-t border-slate-100">
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
        {detailsOpen && detailsAssignment ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeShiftDetails();
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-800">
                    Chi tiết ca: {detailsAssignment.shift_name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDdMm(detailsYmd)} • {detailsAssignment.username} • #{detailsAssignment.id}
                  </p>
                  {detailsStatus ? (
                    <div className="mt-2 inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold border border-slate-100">
                      <span className={`ml-0.5 ${detailsStatus.className}`}>
                        {detailsStatus.text}
                      </span>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closeShiftDetails}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                      placeholder="Nhập ghi chú..."
                      autoFocus
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      (Chỉnh sửa ghi chú sẽ cập nhật ngay vào ca này)
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={savingNotes}
                      onClick={async () => {
                        const ok = await handleSaveNotes(detailsAssignment.id);
                        if (ok) closeShiftDetails();
                      }}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {savingNotes ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      ) : (
                        <Check size={14} />
                      )}
                      Lưu ghi chú
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyId(detailsAssignment.id)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      title="Copy mã ca"
                    >
                      {copiedId === detailsAssignment.id ? (
                        <CheckCheck size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedId === detailsAssignment.id ? "Đã copy" : "Copy"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === detailsAssignment.id}
                      onClick={() => {
                        setConfirmDeleteId(detailsAssignment.id);
                        setConfirmDeleteOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                      title="Xóa phân ca"
                    >
                      {deletingId === detailsAssignment.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {confirmDeleteOpen && confirmDeleteId != null ? (
          <ConfirmDeleteModal
            open={confirmDeleteOpen}
            title="Xóa phân ca?"
            description="Phân ca này sẽ bị xóa khỏi lịch."
            loading={deletingId === confirmDeleteId}
            onCancel={() => {
              setConfirmDeleteOpen(false);
              setConfirmDeleteId(null);
            }}
            onConfirm={() => {
              void (async () => {
                const result = await handleDelete(confirmDeleteId);
                if (result.ok) {
                  showToast("success", result.message);
                  await loadAll();
                  closeShiftDetails();
                } else {
                  showToast("error", result.message);
                }
                setConfirmDeleteOpen(false);
                setConfirmDeleteId(null);
              })();
            }}
          />
        ) : null}
        </div>
      )}
    </div>
  );
}
