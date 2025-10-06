import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["pt-BR", "en", "es"] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

const loadMessages = async (locale: SupportedLocale) => {
  switch (locale) {
    case "en":
      return (await import("../../messages/en.json")).default;
    case "es":
      return (await import("../../messages/es.json")).default;
    case "pt-BR":
    default:
      return (await import("../../messages/pt-BR.json")).default;
  }
};

export default getRequestConfig(async ({ locale }) => {
  const normalizedLocale = locale ?? "pt-BR";
  const isSupported = SUPPORTED_LOCALES.includes(
    normalizedLocale as SupportedLocale
  );
  const activeLocale = isSupported
    ? (normalizedLocale as SupportedLocale)
    : "pt-BR";

  return {
    locale: activeLocale,
    messages: await loadMessages(activeLocale),
  };
});
