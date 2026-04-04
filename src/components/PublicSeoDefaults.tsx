import { useTranslation } from "react-i18next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganization, buildWebSite, defaultLogoAbsoluteUrl } from "@/lib/jsonLd";
import { getSitePublicUrl } from "@/lib/siteUrl";

/** Site-wide Organization + WebSite JSON-LD on public layout routes. */
export default function PublicSeoDefaults() {
  const { t } = useTranslation();
  const base = getSitePublicUrl();
  const name = t("seo.siteName");
  const desc = t("seo.defaultDescription");
  const org = buildOrganization({
    name,
    url: base,
    description: desc,
    logoUrl: defaultLogoAbsoluteUrl(),
  });
  const site = buildWebSite({ name, url: base, description: desc });
  return <JsonLd data={[org, site]} />;
}
