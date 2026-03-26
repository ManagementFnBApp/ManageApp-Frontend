import { getProfile, Profile, updateProfile } from "@/apis/profile";
import ErrorModal from "@/components/ErrorModal/page";
import React, { useState, useEffect } from "react";

export default function ProfileManagement() {
  const [profile, setProfile] = useState<Profile>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for each field
  const [form, setForm] = useState({
    full_name: "",
    avatar: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          avatar: data.avatar || "",
          phone: data.phone || "",
        });
      } catch (error: any) {
        // Nếu lỗi là không tìm thấy profile, tự động tạo profile mới
        if (error.message && error.message.includes("not found")) {
          try {
            // Gọi API tạo profile rỗng đúng chuẩn FE
            const data = await import("@/apis/profile").then((m) =>
              m.createProfile({}),
            );
            setProfile(data);
            setForm({
              full_name: data.full_name || "",
              avatar: data.avatar || "",
              phone: data.phone || "",
            });
          } catch (e: any) {
            setError(e.message || "Tạo profile thất bại");
          }
        } else {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData = {
        ...form,
      };

      await updateProfile(String(profile?.profile_id!), profileData);

      const response = await getProfile();
      setProfile(response);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error)
    return (
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        message={error}
      />
    );

  if (isLoading && !profile) {
    return <div className="p-8">Đang tải thông tin...</div>;
  }

  return (
    <div className="flex-1">
      <div className="bg-white rounded-2xl shadow-md p-8 relative">
        {/* Status */}
        <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit}>
          {profile && (
            <>
              <input
                type="hidden"
                value={profile.user_id ?? ""}
                name="user_id"
              />
              <input
                type="hidden"
                value={profile.profile_id ?? ""}
                name="profile_id"
              />
            </>
          )}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-gray-600 mb-1">Họ và tên</label>
              <input
                name="full_name"
                required
                className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Số điện thoại</label>
              <input
                name="phone"
                required
                pattern="^(0[3|5|7|8|9])[0-9]{8}$"
                title="Số điện thoại phải có 10 số và bắt đầu bằng 03, 05, 07, 08, 09"
                className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Ảnh đại diện</label>
              <input
                name="avatar"
                title="Vui lòng nhập URL hợp lệ cho ảnh đại diện!"
                className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4"
                value={form.avatar}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition"
              >
                {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
