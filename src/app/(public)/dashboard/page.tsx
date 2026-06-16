"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaEdit, FaSave, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface District {
    id: number;
    name: string;
}

interface Upazila {
    id: number;
    name: string;
    district: number;
}

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    district: number | null;
    upazila: number | null;
    street_address: string;
}

export default function UserDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // User profile state
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedUpazila, setSelectedUpazila] = useState("");
    const [streetAddress, setStreetAddress] = useState("");

    // Dropdown options
    const [districts, setDistricts] = useState<District[]>([]);
    const [upazilas, setUpazilas] = useState<Upazila[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }
        
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            // Fetch profile
            const profileRes = await authFetch("/auth/profile/");
            if (!profileRes.ok) {
                throw new Error("প্রোফাইল লোড করতে ব্যর্থ");
            }
            const profileData: UserProfile = await profileRes.json();
            setProfile(profileData);
            setFirstName(profileData.first_name);
            setLastName(profileData.last_name);
            setPhone(profileData.phone);
            setStreetAddress(profileData.street_address || "");
            
            // Fetch districts
            const districtRes = await fetch(`${API_URL}/madrasha/districts/`);
            let sortedDistricts: District[] = [];
            if (districtRes.ok) {
                const dData = await districtRes.json();
                const list = Array.isArray(dData) ? dData : dData.results || [];
                
                // Sort Cumilla first, then Chandpur, then all other districts
                sortedDistricts = [...list].sort((a, b) => {
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
                setDistricts(sortedDistricts);
            }

            // Set initial district and fetch its upazilas
            if (profileData.district) {
                const districtIdStr = String(profileData.district);
                setSelectedDistrict(districtIdStr);
                
                const upazilaRes = await fetch(`${API_URL}/madrasha/upazilas/?district=${profileData.district}`);
                if (upazilaRes.ok) {
                    const uData = await upazilaRes.json();
                    const uList = Array.isArray(uData) ? uData : uData.results || [];
                    setUpazilas(uList);
                    setSelectedUpazila(profileData.upazila ? String(profileData.upazila) : "");
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrict(districtId);
        setSelectedUpazila("");
        setUpazilas([]);
        
        if (!districtId) return;

        try {
            const res = await fetch(`${API_URL}/madrasha/upazilas/?district=${districtId}`);
            if (res.ok) {
                const data = await res.json();
                setUpazilas(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error("Failed to fetch upazilas", err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload = {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                district: selectedDistrict ? Number(selectedDistrict) : null,
                upazila: selectedUpazila ? Number(selectedUpazila) : null,
                street_address: streetAddress
            };

            const res = await authFetch("/auth/profile/", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error("প্রোফাইল আপডেট ব্যর্থ হয়েছে।");
            }

            const updatedProfile = await res.json();
            setProfile(updatedProfile);
            setIsEditing(false);
            setSuccessMessage("আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    // Helper to get district name by ID
    const getDistrictName = (id: number | null) => {
        if (!id) return "প্রদান করা হয়নি";
        const d = districts.find(item => item.id === id);
        return d ? d.name : "প্রদান করা হয়নি";
    };

    // Helper to get upazila name by ID
    const getUpazilaName = (id: number | null) => {
        if (!id) return "প্রদান করা হয়নি";
        // Search in fetched upazilas if populated, else wait/return default
        const u = upazilas.find(item => item.id === id);
        return u ? u.name : "প্রদান করা হয়নি";
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <Breadcrumbs items={[{ label: "ড্যাশবোর্ড" }]} />
            {/* Header info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
                        {profile?.first_name ? profile.first_name[0] : <FaUser className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            আসসালামু আলাইকুম, {profile?.first_name} {profile?.last_name}
                        </h2>
                        <p className="text-sm text-gray-500">আপনার ব্যক্তিগত প্রোফাইল ও ড্যাশবোর্ড</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium transition-colors"
                >
                    <FaSignOutAlt size={14} />
                    <span>লগআউট</span>
                </button>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                    {error}
                </div>
            )}

            {/* Profile Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-base">প্রোফাইল তথ্য</h3>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold rounded-lg transition-colors"
                        >
                            <FaEdit size={12} />
                            <span>সম্পাদনা</span>
                        </button>
                    )}
                </div>

                <div className="p-6 md:p-8">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">ফার্স্ট নেম *</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">লাস্ট নেম *</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">মোবাইল নাম্বার *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">ইমেইল (অপরিবর্তনযোগ্য)</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profile?.email}
                                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">জেলা *</label>
                                    <select
                                        required
                                        value={selectedDistrict}
                                        onChange={(e) => handleDistrictChange(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">থানা/উপজেলা *</label>
                                    <select
                                        required
                                        value={selectedUpazila}
                                        onChange={(e) => setSelectedUpazila(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
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

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">গ্রাম/রাস্তা/মহল্লা *</label>
                                <input
                                    type="text"
                                    required
                                    value={streetAddress}
                                    onChange={(e) => setStreetAddress(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:bg-primary-300"
                                >
                                    <FaSave size={14} />
                                    <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">পুরো নাম</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {profile?.first_name} {profile?.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">ইউজারনেম</p>
                                <p className="text-sm font-medium text-gray-800">{profile?.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">ইমেইল ঠিকানা</p>
                                <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">মোবাইল নাম্বার</p>
                                <p className="text-sm font-medium text-gray-800">{profile?.phone || "প্রদান করা হয়নি"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">জেলা (District)</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {getDistrictName(profile?.district || null)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">থানা/উপজেলা (Upazila)</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {getUpazilaName(profile?.upazila || null)}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">গ্রাম/রাস্তা/মহল্লা (Address)</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {profile?.street_address || "প্রদান করা হয়নি"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
