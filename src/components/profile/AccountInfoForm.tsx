"use client";

import { useState } from "react";
import type { UserResponseDto, UpdateUserDto } from "@/types/user.types";

interface Props {
  user: UserResponseDto;
  onSave: (payload: UpdateUserDto) => Promise<void>;
}

const ROLE_OPTIONS = ["SHOPOWNER", "STAFF", "ADMIN"];

export default function AccountInfoForm({ user, onSave }: Props) {
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [roleId, setRoleId] = useState<number>(user.role_id ?? 0);
  const [shopId, setShopId] = useState<string>(
    user.shop_id != null ? String(user.shop_id) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const isDirty =
    email !== user.email ||
    username !== user.username ||
    roleId !== (user.role_id ?? 0) ||
    shopId !== (user.shop_id != null ? String(user.shop_id) : "");

  const validateUsername = (val: string) => {
    if (val.length > 0 && val.length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameError("");
    }
  };

  const handleSubmit = async () => {
    if (usernameError) return;
    setError("");
    setLoading(true);
    try {
      await onSave({
        email,
        username,
        role_id: roleId || undefined,
        shop_id: shopId ? Number(shopId) : undefined,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Account information
      </h2>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                validateUsername(e.target.value);
              }}
              className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 bg-white text-gray-900 ${
                usernameError
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-gray-300"
              }`}
            />
            {usernameError && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900"
            >
              <option value={0} disabled>Select role</option>
              {ROLE_OPTIONS.map((r, i) => (
                <option key={r} value={i + 1}>
                  {r}
                </option>
              ))}
            </select>
            {user.role && (
              <p className="text-xs text-gray-400">Current: {user.role}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Shop ID</label>
            <input
              type="number"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900 placeholder:text-gray-300"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!isDirty || loading || !!usernameError}
            className="px-4 py-2 text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
