import { client } from "@/client.config";

/**
 * LocalBusiness structured data, generated from client.config.ts.
 * Validate after launch with Google's Rich Results Test.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: client.businessName,
    legalName: client.legalName,
    description: client.metaDescription,
    url: client.siteUrl,
    telephone: client.phoneHref,
    email: client.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: client.address.street,
      addressLocality: client.address.city,
      addressRegion: client.address.region,
      postalCode: client.address.postalCode,
    },
    areaServed: client.about.towns.map((town) => ({
      "@type": "City",
      name: `${town}, ${client.address.region}`,
    })),
    image: client.siteUrl + client.ogImagePath,
    logo: client.siteUrl + client.logoPath,
    sameAs: [
      client.socials.facebook,
      client.socials.instagram,
      client.socials.google,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
