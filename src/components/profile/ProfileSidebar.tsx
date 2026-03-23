"use client";

import type { ProfileResponseDto } from "@/types/user.types";
import type { ProfileTab } from "@/app/(profile)/profile/page";

interface Props {
  profile: ProfileResponseDto;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "profile",
    label: "Profile info",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    key: "account",
    label: "Account & role",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    key: "password",
    label: "Change password",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    key: "status",
    label: "Account status",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileSidebar({
  profile,
  activeTab,
  onTabChange,
}: Props) {
  const displayName = profile.full_name;
  const initials = getInitials(profile.full_name);

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-2">
      {/* Avatar card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-3 mb-1">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xl select-none">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {displayName}
          </p>
          {/* <p className="text-xs text-gray-400 mt-0.5">{user.email}</p> */}
        </div>
        {/* {user.role && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {user.role}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          {user.is_active ? "Active" : "Inactive"}
        </div> */}
      </div>

      {/* Nav */}
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm w-full text-left transition-colors ${
            activeTab === tab.key
              ? "bg-gray-900 text-white font-medium"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </aside>
  );
}
