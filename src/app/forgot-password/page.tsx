"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/apis/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword({ email });
      setMessage(
        response.message || "Password reset link has been sent to your email!"
      );
      setTimeout(() => {
        router.push("/auth?mode=login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
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
                  alt="Forgot Password Background"
                  fill
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
                  Don't Worry!
                </h2>
                <p
                  className="text-white text-lg mb-8"
                  style={{
                    textShadow:
                      "0 2px 20px rgba(0,0,0,0.8), 0 1px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  We'll help you reset your password
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
                  <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Enter your email to receive a reset link
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

                  <div className="relative animate-[slideUp_0.7s_ease-out_0.1s_both]">
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 animate-[slideUp_0.7s_ease-out_0.2s_both] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-8 text-center animate-[fadeIn_0.8s_ease-out_0.3s_both]">
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
