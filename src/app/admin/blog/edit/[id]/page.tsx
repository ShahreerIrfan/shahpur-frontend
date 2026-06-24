"use client";

import { useParams } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";

export default function BlogEditPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <BlogForm postId={id} />
    </div>
  );
}
