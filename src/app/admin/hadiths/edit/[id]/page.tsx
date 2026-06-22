"use client";

import { useParams } from "next/navigation";
import HadithForm from "@/components/admin/HadithForm";

export default function EditHadithPage() {
    const params = useParams();
    return <HadithForm hadithId={params.id as string} />;
}
