import { auth } from '@/auth';
import { fetchRetreatDataServer } from '@/src/components/retreats/shared';
import RetreatEditPage from '@/src/components/retreats/tabs/general';
import { Retreat } from '@/src/types/retreats';

export default async function RetreatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const retreatData = await fetchRetreatDataServer(id, session);

  return (
    <RetreatEditPage
      initialData={retreatData as Retreat} // ✅ Passa dados iniciais
      isCreating={false}
    />
  );
}
