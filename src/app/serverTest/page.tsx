// app/[locale]/dashboard/page.tsx
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("common");
  return <h1>{t("welcome")}</h1>;
}
