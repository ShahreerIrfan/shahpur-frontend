"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaSave, FaSpinner, FaUserTie, FaPlus, FaTrash, FaImage, FaImages } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import ImageGalleryUpload from "@/components/admin/ImageGalleryUpload";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Teacher {
    id?: number;
    key: string;
    teacher_name: string;
    teacher_education_qualification: string;
    teacher_phone_number: string;
    teacher_image?: string | null;
}

interface ExistingPhoto {
    id: number;
    image: string;
}

export default function EditMadrashaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [madrasha, setMadrasha] = useState<Record<string, unknown> | null>(null);
    
    // Teacher states
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [deletedTeacherIds, setDeletedTeacherIds] = useState<number[]>([]);

    // Gallery states
    const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
    const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

    const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
    const [upazilas, setUpazilas] = useState<{ id: number; name: string }[]>([]);
    const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
    const [featuredFile, setFeaturedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch madrasha detail
            const res = await authFetch(`/madrasha/list/${id}/`);
            if (res.ok) {
                const data = await res.json();
                setMadrasha(data);
                
                // Map teachers with unique keys
                if (data.teachers && data.teachers.length > 0) {
                    setTeachers(data.teachers.map((t: Record<string, unknown>) => ({
                        id: t.id as number,
                        key: `teacher-${t.id}`,
                        teacher_name: (t.teacher_name as string) || "",
                        teacher_education_qualification: (t.teacher_education_qualification as string) || "",
                        teacher_phone_number: (t.teacher_phone_number as string) || "",
                        teacher_image: (t.teacher_image as string) || null,
                    })));
                }

                // Map gallery photos
                if (data.photos && data.photos.length > 0) {
                    setExistingPhotos(data.photos);
                }

                // Featured image preview
                if (data.featured_image) {
                    const img = data.featured_image as string;
                    setFeaturedPreview(mediaUrl(img));
                }
            }
            // Fetch districts & upazilas
            const dRes = await fetch(`${API_BASE}/madrasha/districts/`);
            if (dRes.ok) { const d = await dRes.json(); setDistricts(Array.isArray(d) ? d : d.results || []); }
            const uRes = await fetch(`${API_BASE}/madrasha/upazilas/`);
            if (uRes.ok) { const u = await uRes.json(); setUpazilas(Array.isArray(u) ? u : u.results || []); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const addTeacher = () => setTeachers([
        ...teachers,
        {
            key: `new-${Date.now()}-${Math.random()}`,
            teacher_name: "",
            teacher_education_qualification: "",
            teacher_phone_number: "",
        }
    ]);

    const removeTeacher = (i: number) => {
        const teacherToRemove = teachers[i];
        if (teacherToRemove.id) {
            setDeletedTeacherIds(prev => [...prev, teacherToRemove.id!]);
        }
        setTeachers(teachers.filter((_, idx) => idx !== i));
    };

    const updateTeacher = (i: number, field: string, value: string) => {
        const u = [...teachers];
        u[i] = { ...u[i], [field]: value };
        setTeachers(u);
    };

    const handleDeletedPhoto = (photoId: number) => {
        setDeletedPhotoIds(prev => [...prev, photoId]);
        setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const handleFeaturedImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("ফিচার ইমেজের সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না।");
                e.target.value = "";
                return;
            }
            setFeaturedFile(file);
            const r = new FileReader();
            r.onloadend = () => setFeaturedPreview(r.result as string);
            r.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setSaving(true); setError("");
        const token = localStorage.getItem("access_token");
        try {
            // 1. Update madrasha basic info
            const formData = new FormData(e.currentTarget);
            formData.set("show_on_homepage", formData.get("show_on_homepage") === "on" ? "true" : "false");
            if (featuredFile) formData.append("featured_image", featuredFile);
            const res = await authFetch(`/madrasha/list/${id}/`, { method: "PATCH", body: formData });
            if (!res.ok) throw new Error("মাদ্রাসা আপডেট ব্যর্থ");

            // 2. Delete removed teachers
            for (const tId of deletedTeacherIds) {
                await fetch(`${API_BASE}/madrasha/teachers/${tId}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // 3. Create or update remaining teachers
            for (let i = 0; i < teachers.length; i++) {
                const t = teachers[i];
                if (t.teacher_name.trim()) {
                    const tf = new FormData();
                    tf.append("madrasha", id);
                    tf.append("teacher_name", t.teacher_name);
                    tf.append("teacher_education_qualification", t.teacher_education_qualification);
                    tf.append("teacher_phone_number", t.teacher_phone_number);
                    
                    const imgInput = document.querySelector(`input[data-teacher-image="${t.key}"]`) as HTMLInputElement;
                    if (imgInput?.files?.[0]) {
                        tf.append("teacher_image", imgInput.files[0]);
                    }

                    if (t.id) {
                        // Update existing teacher details
                        await fetch(`${API_BASE}/madrasha/teachers/${t.id}/`, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${token}` },
                            body: tf
                        });
                    } else {
                        // Create new teacher
                        await fetch(`${API_BASE}/madrasha/teachers/`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: tf
                        });
                    }
                }
            }

            // 4. Delete removed gallery photos
            for (const photoId of deletedPhotoIds) {
                await fetch(`${API_BASE}/madrasha/photos/${photoId}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // 5. Upload new gallery images
            for (const file of galleryFiles) {
                const pf = new FormData();
                pf.append("madrasha", id);
                pf.append("image", file);
                await fetch(`${API_BASE}/madrasha/photos/`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: pf });
            }

            router.push("/admin/madrasha");
        } catch (err: unknown) { setError(err instanceof Error ? err.message : "সমস্যা হয়েছে"); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    if (!madrasha) return <div className="text-center py-20 text-gray-500">মাদ্রাসা পাওয়া যায়নি</div>;
    const v = (f: string) => (madrasha[f] as string) || "";

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm"><FaArrowLeft className="text-gray-400 w-3.5 h-3.5" /></button>
                <div><h1 className="text-xl font-bold text-gray-800">মাদ্রাসা সম্পাদনা</h1><p className="text-xs text-gray-400">{v("madrasha_name")}</p></div>
            </div>
            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    <div className="space-y-5">
                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2"><div className="w-2 h-2 bg-primary-500 rounded-full"></div><h3 className="font-semibold text-gray-800 text-sm">মাদ্রাসার তথ্য</h3></div>
                            <div className="p-6 space-y-4">
                                <div><label className="block text-xs font-medium text-gray-600 mb-1">মাদ্রাসার নাম *</label><input name="madrasha_name" defaultValue={v("madrasha_name")} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                <div><label className="block text-xs font-medium text-gray-600 mb-1">বর্ণনা</label><textarea name="madrasha_description" defaultValue={v("madrasha_description")} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none resize-none"></textarea></div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">শিক্ষক সংখ্যা</label><input name="number_of_teachers" type="number" defaultValue={madrasha.number_of_teachers as number || 0} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">ছাত্র সংখ্যা</label><input name="number_of_students" type="number" defaultValue={madrasha.number_of_students as number || 0} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">প্রতিষ্ঠাতা</label><input name="founder_of_madrasha" defaultValue={v("founder_of_madrasha")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">প্রতিষ্ঠার সন</label><input name="year_of_establishment" defaultValue={v("year_of_establishment")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                </div>
                            </div>
                        </div>
                        {/* Teachers */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between"><div className="flex items-center gap-2"><FaUserTie className="text-blue-500 w-3.5 h-3.5" /><h3 className="font-semibold text-gray-800 text-sm">শিক্ষক তালিকা</h3></div><span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{teachers.length} জন</span></div>
                            <div className="p-6 space-y-3">
                                {teachers.map((t, i) => (
                                    <div key={t.key} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative group">
                                        <button type="button" onClick={() => removeTeacher(i)} className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-400 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrash className="w-2.5 h-2.5" /></button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-[10px] text-gray-500 mb-1">নাম</label><input value={t.teacher_name} onChange={e => updateTeacher(i, "teacher_name", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                            <div><label className="block text-[10px] text-gray-500 mb-1">যোগ্যতা</label><input value={t.teacher_education_qualification} onChange={e => updateTeacher(i, "teacher_education_qualification", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                            <div><label className="block text-[10px] text-gray-500 mb-1">ফোন</label><input value={t.teacher_phone_number} onChange={e => updateTeacher(i, "teacher_phone_number", e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 mb-1">শিক্ষকের ছবি</label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    data-teacher-image={t.key} 
                                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-primary-50 file:text-primary-700" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && file.size > 5 * 1024 * 1024) {
                                                            alert("শিক্ষকের ছবির সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না।");
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                />
                                                {t.teacher_image && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <img src={mediaUrl(t.teacher_image)} alt={t.teacher_name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                        <span className="text-[10px] text-gray-400">বিদ্যমান ছবি</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addTeacher} className="inline-flex items-center gap-1.5 text-primary-600 text-xs font-medium hover:bg-primary-50 px-3 py-2 rounded-lg"><FaPlus className="w-2.5 h-2.5" /> শিক্ষক যোগ করুন</button>
                            </div>
                        </div>
                        {/* Committee */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div><h3 className="font-semibold text-gray-800 text-sm">কমিটি</h3></div>
                            <div className="p-6 grid grid-cols-2 gap-3">
                                {[{ n: "president", l: "সভাপতি" }, { n: "secretary", l: "সেক্রেটারি" }, { n: "vice_president", l: "সহ-সভাপতি" }, { n: "treasurer", l: "केशিয়ার" }, { n: "curriculum_director", l: "পাঠ্যক্রম পরিচালক" }, { n: "public_relations_officer", l: "যোগাযোগ কর্মকর্তা" }, { n: "technology_it_director", l: "আইটি পরিচালক" }].map(f => (
                                    <div key={f.n}><label className="block text-xs font-medium text-gray-600 mb-1">{f.l}</label><input name={f.n} defaultValue={v(f.n)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                ))}
                            </div>
                        </div>
                        {/* Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2"><div className="w-2 h-2 bg-rose-500 rounded-full"></div><h3 className="font-semibold text-gray-800 text-sm">ঠিকানা</h3></div>
                            <div className="p-6 space-y-3">
                                <div><label className="block text-xs font-medium text-gray-600 mb-1">সম্পূর্ণ ঠিকানা</label><input name="full_address_madrsha" defaultValue={v("full_address_madrsha")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">গ্রাম</label><input name="village" defaultValue={v("village")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">ইউনিয়ন</label><input name="union_parishad" defaultValue={v("union_parishad")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                    <div><label className="block text-xs font-medium text-gray-600 mb-1">পোস্ট অফিস</label><input name="post_office" defaultValue={v("post_office")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                                </div>
                            </div>
                        </div>
                        {/* Others */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div><h3 className="font-semibold text-gray-800 text-sm">অন্যান্য</h3></div>
                            <div className="p-6 grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-medium text-gray-600 mb-1">মাদ্রাসার ধরণ</label><select name="type_of_madrasha" defaultValue={v("type_of_madrasha")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"><option value="">নির্বাচন করুন</option><option value="nurani">নূরানী</option><option value="hifz">হিফজ</option><option value="najera">নাজেরা</option><option value="academic">একাডেমিক</option></select></div>
                                <div><label className="block text-xs font-medium text-gray-600 mb-1">শিক্ষার মাধ্যম</label><select name="medium_of_instruction" defaultValue={v("medium_of_instruction")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"><option value="">নির্বাচন করুন</option><option value="bangla">বাংলা</option><option value="english">ইংরেজি</option></select></div>
                            </div>
                        </div>
                    </div>
                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-4">প্রকাশনা</h4>
                            <label className="flex items-center justify-between mb-4 text-xs text-gray-600 cursor-pointer">
                                হোমপেজে দেখান
                                <input name="show_on_homepage" type="checkbox" defaultChecked={Boolean(madrasha.show_on_homepage)} className="w-4 h-4 accent-primary-500" />
                            </label>
                            <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium"><FaSave className="w-3.5 h-3.5" />{saving ? "সংরক্ষণ হচ্ছে..." : "আপডেট করুন"}</button>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">জেলা (District)</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {districts.map(d => (<label key={d.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"><input type="radio" name="district" value={d.id} defaultChecked={(madrasha.district as number) === d.id} className="w-3.5 h-3.5 text-primary-500" /><span className="text-gray-700 text-xs">{d.name}</span></label>))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">থানা (Upazila)</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {upazilas.map(u => (<label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg"><input type="radio" name="upazila" value={u.id} defaultChecked={(madrasha.upazila as number) === u.id} className="w-3.5 h-3.5 text-primary-500" /><span className="text-gray-700 text-xs">{u.name}</span></label>))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaImage className="text-gray-400 w-3.5 h-3.5" /> ফিচার ইমেজ</h4>
                            {featuredPreview ? (
                                <div className="relative"><img src={featuredPreview} alt="" className="w-full h-36 object-cover rounded-xl" /><button type="button" onClick={() => { setFeaturedPreview(null); setFeaturedFile(null); }} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center"><FaTrash className="w-2.5 h-2.5" /></button></div>
                            ) : (
                                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30"><FaImage className="w-5 h-5 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-500">ছবি আপলোড করুন</p><input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImage} /></label>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><FaImages className="text-gray-400 w-3.5 h-3.5" /> ফটো গ্যালারি</h4>
                            <ImageGalleryUpload
                                existingImages={existingPhotos}
                                onFilesChange={setGalleryFiles}
                                onDeleteExistingImage={handleDeletedPhoto}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
