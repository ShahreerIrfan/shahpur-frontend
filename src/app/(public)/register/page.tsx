"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SpaLink from "@/components/SpaLink";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface District {
    id: number;
    name: string;
}

interface Upazila {
    id: number;
    name: string;
    district: number;
}

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedUpazila, setSelectedUpazila] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Dropdown options
    const [districts, setDistricts] = useState<District[]>([]);
    const [upazilas, setUpazilas] = useState<Upazila[]>([]);

    useEffect(() => {
        // Redirect if already logged in
        if (localStorage.getItem("access_token")) {
            router.push("/dashboard");
            return;
        }
        fetchDistricts();
    }, [router]);

    const fetchDistricts = async () => {
        try {
            const res = await fetch(`${API_BASE}/madrasha/districts/`);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.results || [];
                
                // Sort Cumilla first, then Chandpur, then all other districts
                const sorted = [...list].sort((a, b) => {
                    const nameA = (a.name || "").toLowerCase();
                    const nameB = (b.name || "").toLowerCase();
                    
                    const isCumilla = (name: string) => name.includes("cumilla") || name.includes("কুমিল্লা");
                    const isChandpur = (name: string) => name.includes("chandpur") || name.includes("চাঁদপুর") || name.includes("চান্দপুর");
                    
                    if (isCumilla(nameA) && !isCumilla(nameB)) return -1;
                    if (!isCumilla(nameA) && isCumilla(nameB)) return 1;
                    
                    if (isChandpur(nameA) && !isChandpur(nameB)) return -1;
                    if (!isChandpur(nameA) && isChandpur(nameB)) return 1;
                    
                    return nameA.localeCompare(nameB, 'bn');
                });
                
                setDistricts(sorted);
            }
        } catch (err) {
            console.error("Failed to fetch districts", err);
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrict(districtId);
        setSelectedUpazila("");
        setUpazilas([]);
        
        if (!districtId) return;

        try {
            const res = await fetch(`${API_BASE}/madrasha/upazilas/?district=${districtId}`);
            if (res.ok) {
                const data = await res.json();
                setUpazilas(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error("Failed to fetch upazilas", err);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("পাসওয়ার্ড দুটি মিলছে না");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                district: selectedDistrict ? Number(selectedDistrict) : null,
                upazila: selectedUpazila ? Number(selectedUpazila) : null,
                street_address: streetAddress,
                password: password
            };

            const res = await fetch(`${API_BASE}/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data
                    ? Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`).join("; ")
                    : "নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
                throw new Error(errorMsg);
            }

            // Auto-login after successful registration
            const loginRes = await fetch(`${API_BASE}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });

            if (loginRes.ok) {
                const loginData = await loginRes.json();
                localStorage.setItem("access_token", loginData.access);
                localStorage.setItem("refresh_token", loginData.refresh);
                localStorage.setItem("user_role", loginData.role);
                localStorage.setItem("is_admin", String(loginData.is_admin));
                localStorage.setItem("username", loginData.username);
                
                // Force full reload or header update
                window.location.href = "/dashboard";
            } else {
                router.push("/login?registered=true");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100 my-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUserPlus className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">নিবন্ধন করুন</h1>
                    <p className="text-gray-500 text-sm mt-1">আপনার অ্যাকাউন্ট তৈরি করুন</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-6">
                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ফার্স্ট নেম (First Name) *</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="ফার্স্ট নেম লিখুন"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">লাস্ট নেম (Last Name) *</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="লাস্ট নেম লিখুন"
                            />
                        </div>
                    </div>

                    {/* Mobile & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">মোবাইল নাম্বার (Mobile Number) *</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="01XXXXXXXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ইমেইল (Email) *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="example@mail.com"
                            />
                        </div>
                    </div>

                    {/* District & Upazila */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">জেলা (District) *</label>
                            <select
                                required
                                value={selectedDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            >
                                <option value="">জেলা নির্বাচন করুন</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">থানা/উপজেলা (Upazila) *</label>
                            <select
                                required
                                value={selectedUpazila}
                                onChange={(e) => setSelectedUpazila(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                disabled={!selectedDistrict}
                            >
                                <option value="">উপজেলা নির্বাচন করুন</option>
                                {upazilas.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Street Address */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">গ্রাম/রাস্তা/মহল্লা (Street Address) *</label>
                        <input
                            type="text"
                            required
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="গ্রাম, রাস্তা ও হোল্ডিং নম্বর লিখুন"
                        />
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">পাসওয়ার্ড (Password) *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-10"
                                    placeholder="পাসওয়ার্ড"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">নিশ্চিত করুন (Confirm Password) *</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-10"
                                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit & Redirect */}
                    <div className="space-y-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 rounded-lg font-medium transition-colors text-sm shadow-md"
                        >
                            {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন করুন"}
                        </button>
                        <p className="text-center text-xs text-gray-500">
                            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
                            <SpaLink href="/login" className="text-primary-600 hover:underline font-semibold">
                                লগইন করুন
                            </SpaLink>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
