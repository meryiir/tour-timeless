import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { languageFromPath, normalizeLang } from "@/lib/siteUrl";

/**
 * Keeps i18n synchronized with the `/en`, `/fr`, `/es`, or `/de` path prefix.
 */
export default function LanguageUrlSync() {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const pathLang = languageFromPath(window.location.pathname);
    const current = normalizeLang(i18n.language);
    if (pathLang && pathLang !== current) i18n.changeLanguage(pathLang);
  }, [i18n, location.pathname]);

  return null;
}
