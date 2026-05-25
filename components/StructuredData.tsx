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
    },
  };

  return (
    <script
      type="application/ld+json"
      // Build-time, fully controlled data (no user input), safe to inject as-is.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
