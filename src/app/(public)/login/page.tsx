"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaMosque, FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if already logged in
        if (localStorage.getItem("access_token")) {
            router.push("/dashboard");
            return;
        }

        // Show registration success banner if redirected from /register
        if (searchParams.get("registered") === "true") {
            setSuccessMessage("নিবন্ধন সফল হয়েছে! অনুগ্রহ করে লগইন করুন।");
        }
    }, [router, searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে");
                setLoading(false);
                return;
            }

            // Store tokens
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("is_admin", String(data.is_admin));
            localStorage.setItem("username", data.username);

            // Redirect based on admin status
            if (data.is_admin) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
            }
        } catch {
            setError("সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-primary-50 to-white islamic-pattern py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaMosque className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">শাহপুর দরবার শরীফ</h1>
                        <p className="text-gray-500 text-sm mt-1">লগইন করুন</p>
                    </div>

                    {/* Registration Success */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                ইমেইল ঠিকানা
                            </label>
                            <input
                                id="username"
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                placeholder="আপনার ইমেইল ঠিকানা"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                পাসওয়ার্ড
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-12 text-sm"
                                    placeholder="আপনার পাসওয়ার্ড"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 rounded-lg font-medium transition-colors text-sm shadow-md"
                        >
                            {loading ? "লগইন হচ্ছে..." : "লগইন"}
                        </button>
                    </form>

                    {/* Redirect to Register */}
                    <p className="text-center text-xs text-gray-500 mt-6">
                        কোনো অ্যাকাউন্ট নেই?{" "}
                        <Link href="/register" className="text-primary-600 hover:underline font-semibold">
                            নিবন্ধন করুন
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
