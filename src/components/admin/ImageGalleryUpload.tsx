"use client";

import { useState } from "react";
import { FaImages, FaTimes } from "react-icons/fa";
import { mediaUrl } from "@/lib/media";

interface ExistingImage {
    id: number;
    image: string;
}

interface ImageGalleryUploadProps {
    existingImages?: ExistingImage[];
    onFilesChange: (files: File[]) => void;
    onDeleteExistingImage?: (id: number) => void;
}

export default function ImageGalleryUpload({
    existingImages = [],
    onFilesChange,
    onDeleteExistingImage
}: ImageGalleryUploadProps) {
    const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        const invalidFile = selectedFiles.find(file => file.size > 5 * 1024 * 1024);
        if (invalidFile) {
            alert(`ফাইলের সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না। (ভুল ফাইল: ${invalidFile.name})`);
            e.target.value = "";
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFilesChange(newFiles);

        // Generate previews
        selectedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews((prev) => [...prev, { url: reader.result as string, name: file.name }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be selected again
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
        onFilesChange(newFiles);
    };

    const hasAnyImages = existingImages.length > 0 || previews.length > 0;

    return (
        <div>
            {hasAnyImages && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* Existing Images */}
                    {existingImages.map((img) => (
                        <div key={`existing-${img.id}`} className="relative group">
                            <img src={mediaUrl(img.image)} alt="Existing Gallery" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                            {onDeleteExistingImage && (
                                <button
                                    type="button"
                                    onClick={() => onDeleteExistingImage(img.id)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FaTimes className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* New Previews */}
                    {previews.map((preview, i) => (
                        <div key={`new-${i}`} className="relative group">
                            <img src={preview.url} alt={preview.name} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FaTimes className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                <FaImages className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">
                    {hasAnyImages ? "আরও ছবি যোগ করুন" : "একাধিক ছবি আপলোড করুন"}
                </p>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
            {hasAnyImages && (
                <p className="text-[10px] text-gray-400 mt-1">
                    মোট {existingImages.length + previews.length}টি ছবি (বিদ্যমান: {existingImages.length}, নতুন: {previews.length})
                </p>
            )}
        </div>
    );
}
