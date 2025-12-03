import { fetchRetreatDataServer } from "@/src/components/retreats/shared";
import RetreatEditPage from "@/src/components/retreats/tabs/general";
import { Retreat } from "@/src/types/retreats";

export default async function RetreatPage({
  params,
}: {
  params: { id: string };
}) {
  // ✅ Carrega dados no servidor
  const retreatData = await fetchRetreatDataServer(params.id);

  return (
    <RetreatEditPage
      initialData={retreatData as Retreat} // ✅ Passa dados iniciais
      isCreating={false}
    />
  );
}
