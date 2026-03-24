"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/apis/auth";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword });
      setMessage(response.message || "Password reset successfully!");
      setTimeout(() => {
        router.push("/auth?mode=login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-slate-100 py-12 px-4">
      <div className="w-full max-w-5xl">
        <div
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div className="grid lg:grid-cols-2 min-h-150">
            {/* Image Section */}
            <div className="relative hidden lg:flex flex-col justify-center items-center p-12 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/image/image1.jpg"
                  alt="Reset Password Background"
                  fill
                  sizes="(max-width: 1023px) 0px, 50vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              <div className="relative z-10 text-center space-y-6 max-w-md mx-auto">
                <h2
                  className="text-5xl font-bold text-white mb-4"
                  style={{
                    textShadow:
                      "0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  New Beginning!
                </h2>
                <p
                  className="text-white text-lg mb-8"
                  style={{
                    textShadow:
                      "0 2px 20px rgba(0,0,0,0.8), 0 1px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  Create a strong new password
                </p>
                <button
                  onClick={() => router.push("/auth?mode=login")}
                  className="px-10 py-3 bg-white text-gray-800 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
                  style={{
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Back to Login
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white">
              <div className="w-full max-w-md">
                <div className="mb-10 text-center animate-[fadeInDown_0.6s_ease-out]">
                  <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {message && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm animate-[slideUp_0.5s_ease-out]">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-[slideUp_0.5s_ease-out]">
                      {error}
                    </div>
                  )}

                  {!tokenFromUrl && (
                    <div className="relative animate-[slideUp_0.7s_ease-out_0.1s_both]">
                      <input
                        id="token"
                        type="text"
                        required
                        className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Reset Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="relative animate-[slideUp_0.7s_ease-out_0.2s_both]">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      aria-label={
                        showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:pointer-events-none"
                      onClick={() => setShowNewPassword((v) => !v)}
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" strokeWidth={2} />
                      ) : (
                        <Eye className="w-5 h-5" strokeWidth={2} />
                      )}
                    </button>
                  </div>

                  <div className="relative animate-[slideUp_0.7s_ease-out_0.3s_both]">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Ẩn mật khẩu xác nhận"
                          : "Hiện mật khẩu xác nhận"
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:pointer-events-none"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" strokeWidth={2} />
                      ) : (
                        <Eye className="w-5 h-5" strokeWidth={2} />
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 animate-[slideUp_0.7s_ease-out_0.4s_both] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <div className="mt-8 text-center animate-[fadeIn_0.8s_ease-out_0.5s_both]">
                  <button
                    onClick={() => router.push("/auth?mode=login")}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
