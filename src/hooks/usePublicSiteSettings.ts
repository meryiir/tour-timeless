import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { publicApi } from "@/lib/publicApi";

export function usePublicSiteSettings() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: ["publicSiteSettings", i18n.language],
    queryFn: () => publicApi.getPublicSettings(i18n.language),
    staleTime: 60_000,
  });
}
