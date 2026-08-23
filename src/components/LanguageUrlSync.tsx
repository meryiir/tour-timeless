import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { normalizeLang } from "@/lib/siteUrl";

/**
 * SEO-friendly language URLs via `?lang=xx`.
 * - Reads `lang` from URL and applies i18n language.
 * - Normalizes codes (en-US → en) and ensures a stable `?lang=` param.
 */
export default function LanguageUrlSync() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawLang = (params.get("lang") || "").trim();
    const normalizedFromUrl = rawLang ? normalizeLang(rawLang) : null;
    const current = normalizeLang(i18n.language);

    if (rawLang && normalizedFromUrl !== rawLang.toLowerCase()) {
      params.set("lang", normalizedFromUrl!);
      navigate(
        {
          pathname: location.pathname,
          search: `?${params.toString()}`,
          hash: location.hash,
        },
        { replace: true, state: location.state },
      );
      return;
    }

    if (normalizedFromUrl && normalizedFromUrl !== current) {
      i18n.changeLanguage(normalizedFromUrl);
      return;
    }

    if (!normalizedFromUrl) {
      params.set("lang", current);
      navigate(
        {
          pathname: location.pathname,
          search: `?${params.toString()}`,
          hash: location.hash,
        },
        { replace: true, state: location.state },
      );
    }
  }, [i18n, location.pathname, location.search, location.hash, navigate]);

  return null;
}
