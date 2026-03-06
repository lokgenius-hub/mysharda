import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EventVenue",
  name: "Sharda Palace Banquet & Marriage Hall",
  description:
    "Grand marriage hall and banquet venue near Bhabua, Kaimur, Chainpur and Sasaram. Wedding receptions, engagement ceremonies, birthday parties, corporate events and religious functions.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bhabua Road",
    addressLocality: "Bijnor",
    addressRegion: "Uttar Pradesh",
    postalCode: "246701",
    addressCountry: "IN",
  },
  telephone: "+917303584266",
  url: "https://lokgenius-hub.github.io/mysharda/events/",
  maximumAttendeeCapacity: 500,
};

export const metadata: Metadata = {
  title: "Marriage Hall near Bhabua Kaimur | Banquet Hall | Sharda Palace",
  description:
    "Book the grandest marriage hall and banquet venue near Bhabua, Kaimur, Chainpur & Sasaram at Sharda Palace. Weddings, engagements, birthday parties, corporate events — up to 500 guests. Enquire now.",
  keywords: [
    "marriage hall Bhabua", "marriage hall near Bhabua Bihar",
    "banquet hall Kaimur", "banquet hall near Kaimur Bihar",
    "wedding venue near Bhabua", "wedding hall near Sasaram",
    "shaadi hall Bhabua Kaimur", "shaadi venue Chainpur",
    "event hall Bhabua", "event venue Kaimur district",
    "reception hall near Bhabua", "engagement hall Kaimur",
    "birthday hall near Bhabua Bihar", "birthday party venue Kaimur",
    "corporate event hall near Sasaram", "conference venue Bhabua road",
    "religious function hall Bhabua", "mundan ceremony hall Kaimur",
    "party hall near Chainpur", "wedding caterer Bhabua",
    "Sharda Palace banquet Bijnor", "best marriage hall near Kaimur",
  ],
  openGraph: {
    title: "Marriage Hall & Banquet near Bhabua, Kaimur, Sasaram | Sharda Palace",
    description:
      "Grand banquet hall and wedding venue on Bhabua Road, Bijnor. Serving Bhabua, Kaimur, Chainpur & Sasaram. Capacity up to 500 guests.",
    type: "website",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
