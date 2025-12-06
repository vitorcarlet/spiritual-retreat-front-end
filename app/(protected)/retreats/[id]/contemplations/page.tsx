import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContemplationsPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/retreats/${id}/contemplations/contemplated`);
}
