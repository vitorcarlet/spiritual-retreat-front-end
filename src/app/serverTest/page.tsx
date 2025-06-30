// app/[locale]/dashboard/page.tsx
import { getTranslations } from "next-intl/server";

//testar axios server side, testar next-intl server side e next-auth server side
export default async function DashboardPage() {
  const t = await getTranslations("common");
  return <h1>{t("welcome")}</h1>;
}
