import HadithForm from "@/components/admin/HadithForm";

interface EditHadithPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHadithPage({ params }: EditHadithPageProps) {
  const { id } = await params;
  return <HadithForm hadithId={id} />;
}
