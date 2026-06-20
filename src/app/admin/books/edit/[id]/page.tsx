import BookForm from "@/components/admin/BookForm";

interface EditBookPageProps {
  params: { id: string };
}

export default function EditBookPage({ params }: EditBookPageProps) {
  return <BookForm bookId={params.id} />;
}
