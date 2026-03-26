"use client";

import { useState, useEffect } from "react";
import {
  getPaymentAccount,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  type PaymentAccount,
} from "@/apis/paymentAccountApi";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type Mode = "view" | "create" | "edit";

export default function PaymentSettingsPage() {
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("view");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [checksumKey, setChecksumKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showChecksumKey, setShowChecksumKey] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const data = await getPaymentAccount();
      setAccount(data);
    } catch {
      setError("Không thể tải thông tin tài khoản thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setClientId("");
    setApiKey("");
    setChecksumKey("");
    setShowApiKey(false);
    setShowChecksumKey(false);
    setError("");
    setSuccess("");
    setMode("create");
  };

  const openEdit = () => {
    if (!account) return;
    setClientId(account.client_id);
    setApiKey("");
    setChecksumKey("");
    setShowApiKey(false);
    setShowChecksumKey(false);
    setError("");
    setSuccess("");
    setMode("edit");
  };

  const cancelEdit = () => {
    setMode("view");
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!clientId.trim()) { setError("Vui lòng nhập Client ID."); return; }

    if (mode === "create") {
      if (!apiKey.trim()) { setError("Vui lòng nhập API Key."); return; }
      if (!checksumKey.trim()) { setError("Vui lòng nhập Checksum Key."); return; }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "create") {
        const created = await createPaymentAccount({
          client_id: clientId.trim(),
          api_key: apiKey.trim(),
          checksum_key: checksumKey.trim(),
          gateway_provider: "PAYOS",
        });
        setAccount(created);
        setSuccess("Đã lưu tài khoản PayOS thành công!");
      } else if (mode === "edit" && account) {
        const payload: { client_id?: string; api_key?: string; checksum_key?: string } = {
          client_id: clientId.trim(),
        };
        if (apiKey.trim()) payload.api_key = apiKey.trim();
        if (checksumKey.trim()) payload.checksum_key = checksumKey.trim();

        const updated = await updatePaymentAccount(account.id, payload);
        setAccount(updated);
        setSuccess("Đã cập nhật tài khoản PayOS thành công!");
      }
      setMode("view");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join("; ")
          : typeof msg === "string"
            ? msg
            : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!window.confirm("Xác nhận xóa tài khoản PayOS? Shop sẽ không thể tạo QR thanh toán nữa.")) return;
    setDeleting(true);
    setError("");
    try {
      await deletePaymentAccount(account.id);
      setAccount(null);
      setSuccess("Đã xóa tài khoản PayOS.");
      setMode("view");
    } catch {
      setError("Không thể xóa tài khoản. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Cài đặt thanh toán</h2>
        <p className="text-sm text-slate-500 mt-1">
          Kết nối tài khoản PayOS riêng của shop để nhận thanh toán QR Banking
        </p>
      </div>

      {/* Hướng dẫn lấy credentials */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <h4 className="font-semibold text-blue-800 text-sm">Cách lấy thông tin PayOS</h4>
        </div>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside ml-1">
          <li>Đăng nhập tại <strong>business.payos.vn</strong></li>
          <li>Vào mục <strong>Tích hợp → Thông tin tích hợp</strong></li>
          <li>Sao chép <strong>Client ID</strong>, <strong>API Key</strong>, <strong>Checksum Key</strong></li>
        </ol>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      )}

      {/* Alert messages */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* TRẠNG THÁI: chưa có tài khoản */}
      {!loading && !account && mode === "view" && (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <CreditCard size={28} className="text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Chưa có tài khoản PayOS</p>
            <p className="text-sm text-slate-400 mt-1">
              Thêm credentials PayOS của shop để bật tính năng thanh toán QR
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus size={16} />
            Thêm tài khoản PayOS
          </button>
        </div>
      )}

      {/* TRẠNG THÁI: đã có tài khoản */}
      {!loading && account && mode === "view" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header card */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-green-50">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800 text-sm">PayOS đã kết nối</p>
              <p className="text-xs text-green-600">Shop đã sẵn sàng nhận thanh toán QR Banking</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-green-200 text-green-800 rounded-full uppercase">
              Active
            </span>
          </div>

          {/* Info */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Gateway</span>
              <span className="font-semibold text-slate-700">{account.gateway_provider}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Client ID</span>
              <span className="font-mono text-slate-700 truncate max-w-[240px]">{account.client_id}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">API Key</span>
              <span className="font-mono text-slate-400 text-xs">••••••••••••••••</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Checksum Key</span>
              <span className="font-mono text-slate-400 text-xs">••••••••••••••••</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Ngày thêm</span>
              <span className="text-slate-600">
                {new Date(account.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              <Pencil size={14} />
              Cập nhật
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* FORM: create / edit */}
      {(mode === "create" || mode === "edit") && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-5">
          <h3 className="font-semibold text-slate-800">
            {mode === "create" ? "Thêm tài khoản PayOS" : "Cập nhật tài khoản PayOS"}
          </h3>

          {/* Client ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="VD: cliyekwj400hh01ia..."
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
            />
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">
              API Key{" "}
              {mode === "edit" && (
                <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span>
              )}
              {mode === "create" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={mode === "edit" ? "••••••••••••••••" : "Nhập API Key từ PayOS"}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Checksum Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">
              Checksum Key{" "}
              {mode === "edit" && (
                <span className="text-slate-400 font-normal">(để trống nếu không đổi)</span>
              )}
              {mode === "create" && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showChecksumKey ? "text" : "password"}
                value={checksumKey}
                onChange={(e) => setChecksumKey(e.target.value)}
                placeholder={mode === "edit" ? "••••••••••••••••" : "Nhập Checksum Key từ PayOS"}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowChecksumKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showChecksumKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
