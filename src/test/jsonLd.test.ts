import { describe, expect, it } from "vitest";

import { buildActivityProduct } from "@/lib/jsonLd";

describe("buildActivityProduct", () => {
  it("emits merchant-listing fields appropriate for an in-person tour", () => {
    const product = buildActivityProduct({
      name: "Atlas Mountains day tour",
      description: "An in-person guided tour.",
      url: "https://marrocos-tours.com/en/activities/atlas-mountains",
      brandName: "Marrocos Tours",
      price: 75,
      priceCurrency: "EUR",
    });

    expect(product.brand).toMatchObject({
      "@type": "Brand",
      name: "Marrocos Tours",
    });
    expect(product.offers).toMatchObject({
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "MA",
        },
        doesNotShip: true,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "MA",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    });
  });
});
