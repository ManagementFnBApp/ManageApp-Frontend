"use client";

import { useState } from "react";
import type { UserResponseDto, UpdateUserDto } from "@/types/user.types";

interface Props {
  user: UserResponseDto;
  onSave: (payload: UpdateUserDto) => Promise<void>;
}

export default function ProfileInfoForm({ user, onSave }: Props) {
  const [fullName, setFullName] = useState(user.profile?.full_name ?? "");
  const [phone, setPhone] = useState(user.profile?.phone ?? "");
  const [avatar, setAvatar] = useState(user.profile?.avatar ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDirty =
    fullName !== (user.profile?.full_name ?? "") ||
    phone !== (user.profile?.phone ?? "") ||
    avatar !== (user.profile?.avatar ?? "");

  const handleDiscard = () => {
    setFullName(user.profile?.full_name ?? "");
    setPhone(user.profile?.phone ?? "");
    setAvatar(user.profile?.avatar ?? "");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await onSave({ full_name: fullName, phone, avatar });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Profile information
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-600">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900 placeholder:text-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 900 000 000"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900 placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Avatar URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white text-gray-900 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Avatar preview */}
        {avatar && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <img
              src={avatar}
              alt="Avatar preview"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="text-xs text-gray-400">Avatar preview</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleDiscard}
            disabled={!isDirty || loading}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isDirty || loading}
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
