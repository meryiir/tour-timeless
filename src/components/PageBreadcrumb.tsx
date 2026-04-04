import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbList } from "@/lib/jsonLd";
import { absoluteUrl } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";

export type PageBreadcrumbItem = {
  label: string;
  /** Path starting with `/`. Omit on the last item (current page). */
  to?: string;
};

export interface PageBreadcrumbProps {
  items: PageBreadcrumbItem[];
  /** Path of the current page for JSON-LD (e.g. `/activities` or `/activities/my-tour`). */
  currentPath: string;
  /** Emit BreadcrumbList JSON-LD (disable when the page already injects the same schema). */
  includeJsonLd?: boolean;
  /** `overlay`: text tuned for hero bands (not default page background). */
  variant?: "default" | "overlay";
  /** When `variant` is `overlay`: `dark` = image/dark gradient; `primary` = `bg-primary` sections. */
  overlayTone?: "dark" | "primary";
  className?: string;
}

export function PageBreadcrumb({
  items,
  currentPath,
  includeJsonLd = true,
  variant = "default",
  overlayTone = "primary",
  className,
}: PageBreadcrumbProps) {
  const normalizedCurrent = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;

  const jsonLd = includeJsonLd
    ? buildBreadcrumbList(
        items.map((item, i) => {
          const isLast = i === items.length - 1;
          const path = isLast ? normalizedCurrent : item.to!;
          return {
            name: item.label,
            url: absoluteUrl(path.startsWith("/") ? path : `/${path}`),
          };
        }),
      )
    : null;

  const overlay = variant === "overlay";
  const overlayDark = overlay && overlayTone === "dark";
  const overlayPrimary = overlay && overlayTone === "primary";

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <Breadcrumb className={cn("w-full min-w-0", className)}>
        <BreadcrumbList
          className={cn(
            "text-xs sm:text-sm",
            overlayDark &&
              "text-white/85 [&_a]:text-white/95 [&_a:hover]:text-white [&_span[aria-current=page]]:text-white",
            overlayPrimary &&
              "text-primary-foreground/85 [&_a]:text-primary-foreground [&_a:hover]:text-primary-foreground [&_span[aria-current=page]]:text-primary-foreground",
          )}
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <Fragment key={`${item.label}-${i}`}>
                {i > 0 && (
                  <BreadcrumbSeparator
                    className={cn(
                      overlayDark && "text-white/45 [&>svg]:text-white/45",
                      overlayPrimary && "text-primary-foreground/50 [&>svg]:text-primary-foreground/50",
                    )}
                  />
                )}
                <BreadcrumbItem
                  className={cn(
                    "min-w-0",
                    isLast && "max-w-[min(100%,min(72vw,20rem))] sm:max-w-[min(100%,28rem)]",
                  )}
                >
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        "truncate",
                        overlayDark && "!text-white",
                        overlayPrimary && "!text-primary-foreground",
                      )}
                    >
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.to!} className="truncate">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
