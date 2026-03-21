"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register, ROLE_CODE_ADMIN, ROLE_CODE_SHOP_OWNER } from "@/apis/auth";

const ROLE_CODE_STAFF = "STAFF";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== "register");
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mode === "register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("lumio:subscriptionLoginHint") === "1") {
        sessionStorage.removeItem("lumio:subscriptionLoginHint");
        setSuccessMessage(
          "Thanh toán gói cửa hàng thành công. Vui lòng đăng nhập lại — token mới sẽ có quyền Shop Owner và shop_id để bạn vào trang quản lý cửa hàng.",
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleToggle = () => {
    setIsAnimating(true);
    // Update state immediately for smooth transition
    const newMode = isLogin ? "register" : "login";
    setIsLogin(!isLogin);
    router.replace(`/auth?mode=${newMode}`, { scroll: false });

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await login({
        username: loginData.username,
        password: loginData.password,
      });
      setSuccessMessage("Bạn đã đăng nhập thành công!");

      const role = (response.role ?? "").toString().toUpperCase();
      const returnUrl = searchParams?.get("returnUrl");
      let destination = "/";
      if (role === ROLE_CODE_ADMIN) {
        destination = "/admin";
      } else if (role === ROLE_CODE_SHOP_OWNER || role === ROLE_CODE_STAFF) {
        destination = "/manager";
      }
      // Nếu có returnUrl (vd: sau thanh toán subscription) và là đường dẫn nội bộ, dùng nó
      if (
        returnUrl &&
        typeof returnUrl === "string" &&
        returnUrl.startsWith("/") &&
        !returnUrl.startsWith("//")
      ) {
        destination = returnUrl;
      }

      // Điều hướng ngay để tránh trường hợp user đổi URL trong lúc chờ timeout
      router.replace(destination);
    } catch (err: any) {
      // Ưu tiên message từ API (vd: 403 tài khoản bị chặn)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        err?.originalError?.message;
      if (message) {
        setError(message);
      } else if (
        err?.originalError?.code === "ERR_NETWORK" ||
        err?.message?.includes("Network")
      ) {
        setError(
          "Không thể kết nối đến server. Kiểm tra backend đã chạy và NEXT_PUBLIC_SERVER_API_URL trong .env.",
        );
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại username và mật khẩu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
      });
      setSuccessMessage(`Đăng ký thành công! Hãy đăng nhập và chọn gói dịch vụ để bắt đầu.`);
      setIsLogin(true);
      router.replace("/auth?mode=login");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-blue-50 to-slate-100 py-12 px-4">
      {/* Success popup - góc phải trên màn hình */}
      {successMessage && (
        <div
          className="fixed top-24 right-6 z-[100] animate-[slideInRight_0.4s_ease-out]"
          role="alert"
        >
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-green-500 text-white max-w-md">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <div
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden relative"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            className="relative grid lg:grid-cols-2 min-h-[600px] overflow-hidden"
          >
            {/* Welcome Section with Background - Sliding Panel */}
            <div
              className="relative hidden lg:flex flex-col justify-center items-center p-12 overflow-hidden image-panel"
              style={{
                position: "absolute",
                top: 0,
                left: isLogin ? "0%" : "50%",
                width: "50%",
                height: "100%",
                transition: "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "left",
                zIndex: isLogin ? 1 : 2,
              }}
            >
              {/* Background Image - No Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/image/image1.jpg"
                  alt="Welcome Background"
                  fill
                  sizes="(max-width: 1023px) 0px, 50vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              {/* Content Directly on Image */}
              <div
                className="relative z-10 text-center space-y-6 max-w-md mx-auto"
                style={{
                  transition: "opacity 0.4s ease-out 0.2s, transform 0.4s ease-out 0.2s",
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating
                    ? `translateX(${isLogin ? "-30px" : "30px"})`
                    : "translateX(0)",
                  willChange: "transform, opacity",
                }}
              >
                <h2
                  className="text-5xl font-bold text-white mb-4"
                  style={{
                    textShadow:
                      "0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)",
                    letterSpacing: "-0.02em",
                  }}
                  key={isLogin ? "welcome-login" : "welcome-register"}
                >
                  {isLogin ? "Hello, Welcome!" : "Join Us Today!"}
                </h2>
                <p
                  className="text-white text-lg mb-8"
                  style={{
                    textShadow:
                      "0 2px 20px rgba(0,0,0,0.8), 0 1px 8px rgba(0,0,0,0.6)",
                  }}
                  key={isLogin ? "desc-login" : "desc-register"}
                >
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>
                <button
                  onClick={handleToggle}
                  className="px-10 py-3 bg-white text-gray-800 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
                  style={{
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </div>
            </div>

            {/* Form Section - Sliding Panel */}
            <div
              className="flex items-center justify-center p-8 lg:p-12 bg-white form-panel"
              style={{
                position: "relative",
              }}
              data-is-login={isLogin}
            >
              <div className="w-full max-w-md">
                {/* Login Form */}
                {isLogin ? (
                  <div
                    key="login-form"
                    style={{
                      opacity: isAnimating ? 0 : 1,
                      transform: isAnimating
                        ? "translateX(-30px)"
                        : "translateX(0)",
                      transition: "opacity 0.4s ease-out 0.2s, transform 0.4s ease-out 0.2s",
                      willChange: "transform, opacity",
                    }}
                  >
                    <div className="mb-10 text-center animate-[fadeInDown_0.6s_ease-out]">
                      <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Login
                      </h1>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      {error && (
                        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5">⚠️</span>
                          <span>{error}</span>
                        </div>
                      )}
                      <div className="relative animate-[slideUp_0.7s_ease-out_0.1s_both]">
                        <input
                          id="username"
                          type="text"
                          required
                          autoComplete="username"
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Username"
                          value={loginData.username}
                          onChange={(e) => {
                            setLoginData({ ...loginData, username: e.target.value });
                            if (error) setError("");
                          }}
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="relative animate-[slideUp_0.7s_ease-out_0.2s_both]">
                        <input
                          id="password"
                          type="password"
                          required
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500"
                          placeholder="Password"
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData({ ...loginData, password: e.target.value });
                            if (error) setError("");
                          }}
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="text-right animate-[slideUp_0.7s_ease-out_0.3s_both]">
                        <button
                          type="button"
                          onClick={() => router.push("/forgot-password")}
                          className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          Forgot Password?
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
                        {isLoading ? "Logging in..." : "Login"}
                      </button>
                    </form>

                    <div className="mt-8 text-center animate-[fadeIn_0.8s_ease-out_0.5s_both]">
                      <p className="text-sm text-gray-600">
                        or login with social platforms
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Register Form */
                  <div
                    key="register-form"
                    style={{
                      opacity: isAnimating ? 0 : 1,
                      transform: isAnimating
                        ? "translateX(30px)"
                        : "translateX(0)",
                      transition: "opacity 0.4s ease-out 0.2s, transform 0.4s ease-out 0.2s",
                      willChange: "transform, opacity",
                    }}
                  >
                    <div className="mb-10 text-center animate-[fadeInDown_0.6s_ease-out]">
                      <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Sign Up
                      </h1>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      <div className="relative animate-[slideUp_0.7s_ease-out_0.1s_both]">
                        <input
                          id="username"
                          type="text"
                          required
                          minLength={3}
                          autoComplete="username"
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Username (dùng để đăng nhập)"
                          value={registerData.username}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              username: e.target.value,
                            })
                          }
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="relative animate-[slideUp_0.7s_ease-out_0.15s_both]">
                        <input
                          id="register-email"
                          type="email"
                          required
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Email"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
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

                      <div className="relative animate-[slideUp_0.7s_ease-out_0.2s_both]">
                        <input
                          id="register-password"
                          type="password"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Password"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="relative animate-[slideUp_0.7s_ease-out_0.25s_both]">
                        <input
                          id="confirmPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 pr-10 bg-gray-50 border-0 rounded-xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                          placeholder="Confirm Password"
                          value={registerData.confirmPassword}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              confirmPassword: e.target.value,
                            })
                          }
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-6 animate-[slideUp_0.7s_ease-out_0.3s_both] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {isLoading ? "Signing up..." : "Sign Up"}
                      </button>
                    </form>

                    <div className="mt-8 text-center animate-[fadeIn_0.8s_ease-out_0.4s_both]">
                      <p className="text-sm text-gray-600">
                        or sign up with social platforms
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Login Icons - Common for both */}
                <div className="mt-6 flex justify-center gap-4 animate-[fadeIn_1s_ease-out_0.6s_both]">
                  <button
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all hover:scale-110"
                    title="Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Sliding Panels Animation - Desktop only */
        @media (min-width: 1024px) {
          .form-panel {
            position: absolute !important;
            top: 0;
            width: 50% !important;
            height: 100% !important;
            transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
            will-change: left;
          }

          .form-panel[data-is-login="true"] {
            left: 50% !important;
            z-index: 2;
          }

          .form-panel[data-is-login="false"] {
            left: 0% !important;
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
}
