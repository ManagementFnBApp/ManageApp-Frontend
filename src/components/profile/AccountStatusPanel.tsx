"use client";

import { useState } from "react";
import type { UserResponseDto, UpdateUserDto } from "@/types/user.types";

interface Props {
  user: UserResponseDto;
  onSave: (payload: UpdateUserDto) => Promise<void>;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MetaCard = ({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className={`text-sm font-medium text-gray-900 ${valueClass}`}>{value}</p>
  </div>
);

export default function AccountStatusPanel({ user, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      await onSave({ is_active: !user.is_active });
      setConfirmDeactivate(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Meta info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Account status & dates
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <MetaCard
            label="Status"
            value={user.is_active ? "Active" : "Inactive"}
            valueClass={user.is_active ? "text-green-600" : "text-red-500"}
          />
          <MetaCard label="User ID" value={`#${user.user_id}`} />
          <MetaCard
            label="Last login"
            value={formatDateTime(user.last_login)}
          />
          <MetaCard
            label="Account created"
            value={formatDate(user.created_at)}
          />
          <MetaCard label="Last updated" value={formatDate(user.updated_at)} />
          <MetaCard
            label="Owner manager ID"
            value={
              user.owner_manager_id != null ? `#${user.owner_manager_id}` : "—"
            }
          />
          <MetaCard
            label="Shop ID"
            value={user.shop_id != null ? `#${user.shop_id}` : "—"}
          />
          <MetaCard
            label="Role ID"
            value={user.role_id != null ? `#${user.role_id}` : "—"}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-5">
          Danger zone
        </h2>

        {!confirmDeactivate ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.is_active ? "Deactivate account" : "Reactivate account"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user.is_active
                  ? "Disables login access. Can be reactivated by an admin."
                  : "Re-enables login access for this account."}
              </p>
            </div>
            <button
              onClick={() => setConfirmDeactivate(true)}
              className="shrink-0 px-4 py-2 text-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              {user.is_active ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-700">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-500">
                {user.is_active ? "deactivate" : "reactivate"}
              </span>{" "}
              this account?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeactivate(false)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleActive}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Yes, {user.is_active ? "deactivate" : "reactivate"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
