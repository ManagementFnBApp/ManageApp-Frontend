"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/apis/profileApi";
import { changePassword } from "@/apis/auth";
import type {
  UpdateUserDto,
  ChangePasswordDto,
  ProfileResponseDto,
} from "@/types/user.types";

import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import AccountInfoForm from "@/components/profile/AccountInfoForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import AccountStatusPanel from "@/components/profile/AccountStatusPanel";

export type ProfileTab = "profile" | "account" | "password" | "status";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponseDto>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // const userId = localStorage.getItem("userId");
    // if (!userId) return;

    getProfile()
      .then((data) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    console.log("profile: " + profile);
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  // const handleUpdateUser = async (payload: UpdateUserDto) => {
  //   if (!user) return;
  //   const updated = await updateUser(user.user_id, payload);
  //   setUser(updated);
  //   // sync localStorage
  //   const raw = localStorage.getItem("user");
  //   if (raw) {
  //     const parsed = JSON.parse(raw);
  //     localStorage.setItem("user", JSON.stringify({ ...parsed, ...updated }));
  //   }
  //   showToast("Changes saved successfully");
  // };

  const handleChangePassword = async (payload: ChangePasswordDto) => {
    await changePassword(payload);
    showToast("Password updated successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen text-gray-500">
  //       Unable to load profile.
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {successMessage && (
        <div
          className="fixed top-24 right-6 z-100 animate-[slideInRight_0.4s_ease-out]"
          role="alert"
        >
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-green-500 text-white max-w-sm">
            <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          My Profile
        </h1>

        <div className="flex gap-6 items-start">
          {profile && (
            <ProfileSidebar
              profile={profile}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* <div className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <ProfileInfoForm user={user} onSave={handleUpdateUser} />
            )}
            {activeTab === "account" && (
              <AccountInfoForm user={user} onSave={handleUpdateUser} />
            )}
            {activeTab === "password" && (
              <ChangePasswordForm onSave={handleChangePassword} />
            )}
            {activeTab === "status" && (
              <AccountStatusPanel user={user} onSave={handleUpdateUser} />
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
