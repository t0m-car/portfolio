import { content } from "@/lib/content";

const SITE = "https://tomca.be";

const PROFILES = [
  "https://github.com/t0m-car",
  "https://www.linkedin.com/in/tom-cardoen/",
];

const KNOWS_ABOUT = [
  "Software engineering",
  "Web development",
  "Mobile app development",
  "Product design",
  "TypeScript",
  "React",
  "Three.js",
];

export function StructuredData() {
  const [name = "Tom Cardoen", jobTitle = "Software Engineer", location = "Liège, BE"] =
    content.hero.metaLine.split(" · ");
  const [addressLocality = "Liège", addressCountry = "BE"] = location.split(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE}/#profilepage`,
    inLanguage: "en-GB",
    url: SITE,
    mainEntity: {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name,
      jobTitle,
      url: SITE,
      image: `${SITE}/me.jpg`,
      description: content.meta.description,
      address: {
        "@type": "PostalAddress",
        addressLocality,
        addressCountry,
      },
      worksFor: [
        { "@type": "Organization", name: "Azimut", url: "https://azimut.be" },
        {
          "@type": "Organization",
          name: "Nodeo",
          url: "https://nodeo.be",
          founder: { "@id": `${SITE}/#person` },
        },
      ],
      alumniOf: { "@type": "EducationalOrganization", name: "HELMo", url: "https://www.helmo.be" },
      sameAs: PROFILES,
      knowsAbout: KNOWS_ABOUT,
      owns: { "@id": `${SITE}/#footics` },
    },
  };

  // Footics is Tom's own product. A WebApplication node cross-linked to the Person
  // (creator/author/owns) associates him with it for search engines.
  const footicsLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE}/#footics`,
    name: "Footics",
    url: "https://footics.app",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    inLanguage: "fr-BE",
    description:
      "Free, ad-free World Cup 2026 score-prediction game for private groups of friends. No money betting, just bragging rights.",
    creator: { "@id": `${SITE}/#person` },
    author: { "@id": `${SITE}/#person` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Build-time, fully controlled data (no user input), safe to inject as-is.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(footicsLd) }}
      />
    </>
  );
}
