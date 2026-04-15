import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGS = new Set(["en", "fr", "es", "de"]);

/**
 * SEO-friendly language URLs via `?lang=xx`.
 * - Reads `lang` from URL and applies i18n language.
 * - Normalizes URL to include `?lang=currentLanguage` so canonical/hreflang are stable.
 */
export default function LanguageUrlSync() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lang = (params.get("lang") || "").trim().toLowerCase();
    const current = (i18n.language || "en").toLowerCase();

    if (lang && SUPPORTED_LANGS.has(lang) && lang !== current) {
      i18n.changeLanguage(lang);
      return;
    }

    // Ensure URL always carries the language param for stable indexing/sharing.
    if (!lang && SUPPORTED_LANGS.has(current)) {
      params.set("lang", current);
      navigate(
        {
          pathname: location.pathname,
          search: `?${params.toString()}`,
          hash: location.hash,
        },
        { replace: true },
      );
    }
  }, [i18n, location.pathname, location.search, location.hash, navigate]);

  return null;
}

