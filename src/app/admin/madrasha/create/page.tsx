"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaArrowLeft, FaSave, FaUserTie, FaImage, FaImages } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import ImageGalleryUpload from "@/components/admin/ImageGalleryUpload";

interface Teacher {
    teacher_name: string;
    teacher_education_qualification: string;
    teacher_phone_number: string;
}

interface District {
    id: number;
    name: string;
}

interface Upazila {
    id: number;
    name: string;
    district: number;
}

export default function CreateMadrashaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [upazilas, setUpazilas] = useState<Upazila[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const galleryFilesRef = useRef<File[]>([]);

    const API = API_URL;

    useEffect(() => {
        fetchDistricts();
        fetchUpazilas();
    }, []);

    const fetchDistricts = async () => {
        try {
            const res = await fetch(`${API_URL}/madrasha/districts/`);
            if (res.ok) {
                const data = await res.json();
                setDistricts(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error("Failed to fetch districts", err);
        }
    };

    const fetchUpazilas = async (districtId?: string) => {
        try {
            const url = districtId
                ? `${API_URL}/madrasha/upazilas/?district=${districtId}`
                : `${API_URL}/madrasha/upazilas/`;
            const res = await fetch(url);
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

    const addTeacher = () => {
        setTeachers([...teachers, { teacher_name: "", teacher_education_qualification: "", teacher_phone_number: "" }]);
    };

    const removeTeacher = (index: number) => {
        setTeachers(teachers.filter((_, i) => i !== index));
    };

    const updateTeacher = (index: number, field: keyof Teacher, value: string) => {
        const updated = [...teachers];
        updated[index] = { ...updated[index], [field]: value };
        setTeachers(updated);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formElement = e.currentTarget;
            const formData = new FormData();

            // Basic info
            formData.append("madrasha_name", (formElement.querySelector('[name="madrasha_name"]') as HTMLInputElement).value);
            formData.append("madrasha_description", (formElement.querySelector('[name="madrasha_description"]') as HTMLTextAreaElement).value);
            formData.append("number_of_teachers", (formElement.querySelector('[name="number_of_teachers"]') as HTMLInputElement).value || "0");
            formData.append("number_of_students", (formElement.querySelector('[name="number_of_students"]') as HTMLInputElement).value || "0");
            formData.append("founder_of_madrasha", (formElement.querySelector('[name="founder_of_madrasha"]') as HTMLInputElement).value);
            formData.append("year_of_establishment", (formElement.querySelector('[name="year_of_establishment"]') as HTMLInputElement).value);

            // Committee
            const committeeFields = ["president", "secretary", "vice_president", "treasurer", "curriculum_director", "public_relations_officer", "technology_it_director"];
            committeeFields.forEach((field) => {
                const el = formElement.querySelector(`[name="${field}"]`) as HTMLInputElement;
                if (el && el.value) formData.append(field, el.value);
            });

            // Address
            formData.append("full_address_madrsha", (formElement.querySelector('[name="full_address_madrsha"]') as HTMLInputElement)?.value || "");
            formData.append("village", (formElement.querySelector('[name="village"]') as HTMLInputElement)?.value || "");
            formData.append("union_parishad", (formElement.querySelector('[name="union_parishad"]') as HTMLInputElement)?.value || "");
            formData.append("post_office", (formElement.querySelector('[name="post_office"]') as HTMLInputElement)?.value || "");

            // Taxonomy
            const districtRadio = formElement.querySelector('input[name="district"]:checked') as HTMLInputElement;
            const upazilaRadio = formElement.querySelector('input[name="upazila"]:checked') as HTMLInputElement;
            if (districtRadio) formData.append("district", districtRadio.value);
            if (upazilaRadio) formData.append("upazila", upazilaRadio.value);

            // Others
            formData.append("type_of_madrasha", (formElement.querySelector('[name="type_of_madrasha"]') as HTMLSelectElement)?.value || "");
            formData.append("medium_of_instruction", (formElement.querySelector('[name="medium_of_instruction"]') as HTMLSelectElement)?.value || "");

            // Featured image
            if (featuredImageFile) {
                formData.append("featured_image", featuredImageFile);
            }

            formData.append("is_published", "true");

            const res = await authFetch(`/madrasha/list/`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                const errorMsg = errorData
                    ? Object.entries(errorData).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`).join("; ")
                    : "মাদ্রাসা সংরক্ষণ করতে সমস্যা হয়েছে।";
                throw new Error(errorMsg);
            }

            const madrashaData = await res.json();

            // Create teachers with images
            if (teachers.length > 0) {
                const token = localStorage.getItem("access_token");
                for (let i = 0; i < teachers.length; i++) {
                    const teacher = teachers[i];
                    if (teacher.teacher_name.trim()) {
                        const teacherForm = new FormData();
                        teacherForm.append("madrasha", String(madrashaData.id));
                        teacherForm.append("teacher_name", teacher.teacher_name);
                        teacherForm.append("teacher_education_qualification", teacher.teacher_education_qualification);
                        teacherForm.append("teacher_phone_number", teacher.teacher_phone_number);
                        // Get teacher image from file input if exists
                        const imgInput = document.querySelector(`input[data-teacher-image="${i}"]`) as HTMLInputElement;
                        if (imgInput && imgInput.files && imgInput.files[0]) {
                            teacherForm.append("teacher_image", imgInput.files[0]);
                        }
                        await fetch(`${API_URL}/madrasha/teachers/`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: teacherForm,
                        });
                    }
                }
            }

            // Upload gallery images
            if (galleryFilesRef.current.length > 0) {
                const token = localStorage.getItem("access_token");
                for (const file of galleryFilesRef.current) {
                    const photoForm = new FormData();
                    photoForm.append("madrasha", String(madrashaData.id));
                    photoForm.append("image", file);
                    await fetch(`${API_URL}/madrasha/photos/`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: photoForm,
                    });
                }
            }

            router.push("/admin/madrasha");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "একটি অজানা সমস্যা হয়েছে।";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">নতুন মাদ্রাসা যোগ করুন</h1>
                    <p className="text-xs text-gray-400 mt-0.5">মাদ্রাসার সকল তথ্য পূরণ করুন</p>
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
                    {/* Main Content - Left */}
                    <div className="space-y-5">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">মাদ্রাসার তথ্য</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Basic Information</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">মাদ্রাসার নাম <span className="text-red-500">*</span></label>
                                    <input name="madrasha_name" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="মাদ্রাসার নাম লিখুন" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">মাদ্রাসার বর্ণনা</label>
                                    <textarea name="madrasha_description" rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all resize-none" placeholder="মাদ্রাসার বিস্তারিত বর্ণনা"></textarea>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">শিক্ষক সংখ্যা</label>
                                        <input name="number_of_teachers" type="number" defaultValue={0} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">ছাত্র সংখ্যা</label>
                                        <input name="number_of_students" type="number" defaultValue={0} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রতিষ্ঠাতা</label>
                                        <input name="founder_of_madrasha" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="নাম" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রতিষ্ঠার সন</label>
                                        <input name="year_of_establishment" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="২০০০" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teachers */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaUserTie className="text-blue-500 w-3.5 h-3.5" />
                                    <h3 className="font-semibold text-gray-800 text-sm">শিক্ষক তালিকা</h3>
                                </div>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{teachers.length} জন</span>
                            </div>
                            <div className="p-6">
                                {teachers.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-150 rounded-xl bg-gray-50/50">
                                        <FaUserTie className="w-7 h-7 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm mb-3">কোনো শিক্ষক যোগ করা হয়নি</p>
                                        <button type="button" onClick={addTeacher} className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-xs bg-primary-50 px-3 py-1.5 rounded-lg">
                                            <FaPlus className="w-2.5 h-2.5" /> শিক্ষক যোগ করুন
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {teachers.map((teacher, index) => (
                                            <div key={index} className="relative bg-gray-50 rounded-xl p-4 border border-gray-100 group">
                                                <button type="button" onClick={() => removeTeacher(index)} className="absolute top-2 right-2 w-7 h-7 bg-white border border-red-100 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                    <FaTrash className="w-2.5 h-2.5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">শিক্ষকের নাম</label>
                                                        <input value={teacher.teacher_name} onChange={(e) => updateTeacher(index, "teacher_name", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="নাম" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">শিক্ষাগত যোগ্যতা</label>
                                                        <input value={teacher.teacher_education_qualification} onChange={(e) => updateTeacher(index, "teacher_education_qualification", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="কামিল, ফাজিল" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">ফোন নাম্বার</label>
                                                        <input value={teacher.teacher_phone_number} onChange={(e) => updateTeacher(index, "teacher_phone_number", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="01XXXXXXXXX" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">শিক্ষকের ছবি</label>
                                                        <input type="file" accept="image/*" data-teacher-image={index} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary-50 file:text-primary-700" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addTeacher} className="inline-flex items-center gap-1.5 text-primary-600 font-medium text-xs hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors">
                                            <FaPlus className="w-2.5 h-2.5" /> আরও শিক্ষক যোগ করুন
                                        </button>
                                    </div>
                                )}
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
                                    { name: "president", label: "সভাপতি" },
                                    { name: "secretary", label: "সেক্রেটারি" },
                                    { name: "vice_president", label: "সহ-সভাপতি" },
                                    { name: "treasurer", label: "কেশিয়ার" },
                                    { name: "curriculum_director", label: "পাঠ্যক্রম পরিচালক" },
                                    { name: "public_relations_officer", label: "যোগাযোগ কর্মকর্তা" },
                                    { name: "technology_it_director", label: "আইটি পরিচালক" },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                                        <input name={field.name} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder={field.label + "র নাম"} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">মাদ্রাসার ঠিকানা</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Address</span>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">সম্পূর্ণ ঠিকানা</label>
                                    <input name="full_address_madrsha" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="সম্পূর্ণ ঠিকানা" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">গ্রাম</label>
                                        <input name="village" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="গ্রাম" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">ইউনিয়ন</label>
                                        <input name="union_parishad" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="ইউনিয়ন" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">পোস্ট অফিস</label>
                                        <input name="post_office" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all" placeholder="পোস্ট অফিস" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Others */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                <h3 className="font-semibold text-gray-800 text-sm">অন্যান্য তথ্য</h3>
                                <span className="text-[10px] text-gray-400 ml-auto">Others</span>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">মাদ্রাসার ধরণ</label>
                                    <select name="type_of_madrasha" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all appearance-none">
                                        <option value="">নির্বাচন করুন</option>
                                        <option value="nurani">নূরানী</option>
                                        <option value="hifz">হিফজ</option>
                                        <option value="najera">নাজেরা</option>
                                        <option value="academic">একাডেমিক</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শিক্ষার মাধ্যম</label>
                                    <select name="medium_of_instruction" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all appearance-none">
                                        <option value="">নির্বাচন করুন</option>
                                        <option value="bangla">বাংলা</option>
                                        <option value="english">ইংরেজি</option>
                                    </select>
                                </div>
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
                            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                <FaSave className="w-3.5 h-3.5" />
                                {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
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
                                            <input type="radio" name="upazila" value={u.id} className="w-3.5 h-3.5 text-primary-500 border-gray-300 focus:ring-primary-500" />
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
                            <ImageGalleryUpload onFilesChange={(f) => { setGalleryFiles(f); galleryFilesRef.current = f; }} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
