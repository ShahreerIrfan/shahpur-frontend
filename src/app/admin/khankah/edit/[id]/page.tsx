"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaSave, FaSpinner, FaImage, FaImages, FaTrash } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import ImageGalleryUpload from "@/components/admin/ImageGalleryUpload";

interface District {
    id: number;
    name: string;
}

interface Upazila {
    id: number;
    name: string;
    district: number;
}

interface ExistingPhoto {
    id: number;
    image: string;
}

export default function EditKhankahPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [khankah, setKhankah] = useState<Record<string, any> | null>(null);

    const [districts, setDistricts] = useState<District[]>([]);
    const [upazilas, setUpazilas] = useState<Upazila[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");

    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

    // Gallery states
    const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
    const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            // 1. Fetch Khankah details
            const kRes = await authFetch(`/khankah/list/${id}/`);
            if (!kRes.ok) throw new Error("খানকাহ পাওয়া যায়নি");
            const kData = await kRes.json();
            setKhankah(kData);

            if (kData.district) {
                setSelectedDistrict(String(kData.district));
            }

            if (kData.featured_image) {
                setFeaturedImagePreview(mediaUrl(kData.featured_image));
            }

            if (kData.photos) {
                setExistingPhotos(kData.photos);
            }

            // 2. Fetch all districts
            const dRes = await fetch(`${API_URL}/madrasha/districts/`);
            if (dRes.ok) {
                const dData = await dRes.json();
                setDistricts(Array.isArray(dData) ? dData : dData.results || []);
            }

            // 3. Fetch upazilas (filtered by district if set, otherwise fetch all)
            const uUrl = kData.district
                ? `${API_URL}/madrasha/upazilas/?district=${kData.district}`
                : `${API_URL}/madrasha/upazilas/`;
            const uRes = await fetch(uUrl);
            if (uRes.ok) {
                const uData = await uRes.json();
                setUpazilas(Array.isArray(uData) ? uData : uData.results || []);
            }

        } catch (err: any) {
            setError(err.message || "খানকাহ লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    const fetchUpazilas = async (districtId: string) => {
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

    const handleDistrictChange = (districtId: string) => {
        setSelectedDistrict(districtId);
        fetchUpazilas(districtId);
    };

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFeaturedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletedPhoto = (photoId: number) => {
        setDeletedPhotoIds(prev => [...prev, photoId]);
        setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const token = localStorage.getItem("access_token");

        try {
            const formElement = e.currentTarget;
            const formData = new FormData();

            // Basic info
            formData.append("khankah_name", (formElement.querySelector('[name="khankah_name"]') as HTMLInputElement).value);
            formData.append("khankah_description", (formElement.querySelector('[name="khankah_description"]') as HTMLTextAreaElement).value);

            // Address
            formData.append("full_address", (formElement.querySelector('[name="full_address"]') as HTMLInputElement)?.value || "");
            formData.append("village", (formElement.querySelector('[name="village"]') as HTMLInputElement)?.value || "");
            formData.append("ward", (formElement.querySelector('[name="ward"]') as HTMLInputElement)?.value || "");
            formData.append("union", (formElement.querySelector('[name="union"]') as HTMLInputElement)?.value || "");

            // Committee
            const committeeFields = ["director_name", "director_phone", "president_name", "vice_president_name", "secretary_name", "cashier_name"];
            committeeFields.forEach((field) => {
                const el = formElement.querySelector(`[name="${field}"]`) as HTMLInputElement;
                if (el && el.value) formData.append(field, el.value);
            });

            // Taxonomy
            const districtRadio = formElement.querySelector('input[name="district"]:checked') as HTMLInputElement;
            const upazilaRadio = formElement.querySelector('input[name="upazila"]:checked') as HTMLInputElement;
            if (districtRadio) formData.append("district", districtRadio.value);
            if (upazilaRadio) formData.append("upazila", upazilaRadio.value);

            // Featured image
            if (featuredImageFile) {
                formData.append("featured_image", featuredImageFile);
            }

            formData.append("is_published", "true");

            // 1. Update basic details
            const res = await authFetch(`/khankah/list/${id}/`, {
                method: "PATCH",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                const errorMsg = errorData
                    ? Object.entries(errorData).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`).join("; ")
                    : "খানকাহ আপডেট করতে সমস্যা হয়েছে।";
                throw new Error(errorMsg);
            }

            // 2. Delete removed gallery photos
            for (const photoId of deletedPhotoIds) {
                await fetch(`${API_URL}/khankah/photos/${photoId}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // 3. Upload new gallery photos
            for (const file of galleryFiles) {
                const pf = new FormData();
                pf.append("khankah", id);
                pf.append("image", file);
                await fetch(`${API_URL}/khankah/photos/`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: pf
                });
            }

            router.push("/admin/khankah");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "আপডেট করতে সমস্যা হয়েছে।";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    if (!khankah) return <div className="text-center py-20 text-gray-500">খানকাহ পাওয়া যায়নি</div>;
    const v = (f: string) => (khankah[f] as string) || "";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">খানকাহ সম্পাদনা</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{v("khankah_name")}</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    {/* Main Content */}
                    <div className="space-y-5">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">খানকার তথ্য</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Khankah Information</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">খানকার নাম <span className="text-red-500">*</span></label>
                                    <input name="khankah_name" defaultValue={v("khankah_name")} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">খানকার বর্ণনা</label>
                                    <textarea name="khankah_description" defaultValue={v("khankah_description")} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all resize-none"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">খানকার ঠিকানা</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Address</span>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">সম্পূর্ণ ঠিকানা</label>
                                    <input name="full_address" defaultValue={v("full_address")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">গ্রাম</label>
                                        <input name="village" defaultValue={v("village")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">ওয়ার্ড</label>
                                        <input name="ward" defaultValue={v("ward")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">ইউনিয়ন</label>
                                        <input name="union" defaultValue={v("union")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Committee */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">কমিটি</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Committee</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { name: "director_name", label: "পরিচালকের নাম" },
                                    { name: "director_phone", label: "পরিচালকের ফোন নাম্বার" },
                                    { name: "president_name", label: "সভাপতির নাম" },
                                    { name: "vice_president_name", label: "সহ-সভাপতির নাম" },
                                    { name: "secretary_name", label: "সেক্রেটারি নাম" },
                                    { name: "cashier_name", label: "ক্যাশিয়ারের নাম" },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                                        <input name={field.name} defaultValue={v(field.name)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-5">
                        {/* Publish */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-4">প্রকাশনা</h4>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-gray-500">স্ট্যাটাস</span>
                                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Published</span>
                            </div>
                            <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                <FaSave className="w-3.5 h-3.5" />
                                {saving ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                            </button>
                        </div>

                        {/* District */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">জেলা (District)</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                                {districts.length > 0 ? (
                                    districts.map((d) => (
                                        <label key={d.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg">
                                            <input
                                                type="radio"
                                                name="district"
                                                value={d.id}
                                                checked={selectedDistrict === String(d.id)}
                                                onChange={() => handleDistrictChange(String(d.id))}
                                                className="w-3.5 h-3.5 text-primary-500 border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-700 text-xs">{d.name}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400">কোনো জেলা পাওয়া যায়নি</p>
                                )}
                            </div>
                        </div>

                        {/* Upazila */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">থানা (Upazila)</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                                {upazilas.length > 0 ? (
                                    upazilas.map((u) => (
                                        <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg">
                                            <input
                                                type="radio"
                                                name="upazila"
                                                value={u.id}
                                                defaultChecked={khankah.upazila === u.id}
                                                className="w-3.5 h-3.5 text-primary-500 border-gray-300 focus:ring-primary-500"
                                            />
                                            <span className="text-gray-700 text-xs">{u.name}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400">{selectedDistrict ? "এই জেলায় কোনো থানা পাওয়া যায়নি" : "প্রথমে একটি জেলা নির্বাচন করুন"}</p>
                                )}
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FaImage className="text-gray-400 w-3.5 h-3.5" /> ফিচার ইমেজ
                            </h4>
                            {featuredImagePreview ? (
                                <div className="relative">
                                    <img src={featuredImagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                    <button
                                        type="button"
                                        onClick={() => { setFeaturedImagePreview(null); setFeaturedImageFile(null); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600"
                                    >
                                        <FaTrash className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                                    <FaImage className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">ছবি আপলোড করুন</p>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageChange} />
                                </label>
                            )}
                        </div>

                        {/* Photo Gallery */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <FaImages className="text-gray-400 w-3.5 h-3.5" /> ফটো গ্যালারি
                            </h4>
                            <ImageGalleryUpload
                                existingImages={existingPhotos}
                                onFilesChange={(f) => setGalleryFiles(f)}
                                onDeleteExistingImage={handleDeletedPhoto}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
