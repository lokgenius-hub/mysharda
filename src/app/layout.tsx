import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";
import { DEFAULT_CONFIG } from "@/lib/site-config-defaults";

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || DEFAULT_CONFIG.hotel_name
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL   || 'https://example.com'

// Per-tenant theme colours — set via env vars in .env.local or GitHub Variables
// Sharda Palace: primary=var(--primary) bg=var(--bg-deep) (gold on dark, default)
// Raj Darbar:    primary=#e63946 bg=#1a0a0a (red on near-black)
// Green Park:    primary=#2d9e4f bg=#0a1a0f (green on dark green)
const PRIMARY_COLOR   = process.env.NEXT_PUBLIC_PRIMARY_COLOR   || '#c9a84c'
const PRIMARY_LIGHT   = process.env.NEXT_PUBLIC_PRIMARY_LIGHT   || '#f5d78e'
const BG_COLOR        = process.env.NEXT_PUBLIC_BG_COLOR        || '#0f0f23'
const CARD_COLOR      = process.env.NEXT_PUBLIC_CARD_COLOR      || '#1a1a2e'

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Hotel",
      "@id": "https://lokgenius-hub.github.io/mysharda/#hotel",
      name: DEFAULT_CONFIG.hotel_name,
      url: "https://lokgenius-hub.github.io/mysharda/",
      telephone: DEFAULT_CONFIG.phone.replace(/[\s\-()]/g, ''),
      email: DEFAULT_CONFIG.email,
      description: DEFAULT_CONFIG.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Behind Patnwar Petrol Pump, Ward No. 18, Near Panda Ji Pokhra",
        addressLocality: "Bhabua",
        addressRegion: "Bihar",
        postalCode: "821101",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 25.0430,
        longitude: 83.6057,
      },
      image: "https://ydgriludptadkoqkkuwt.supabase.co/storage/v1/object/public/site-images/heroHome.jpg",
      priceRange: "₹₹",
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi",          value: true },
        { "@type": "LocationFeatureSpecification", name: "AC Rooms",            value: true },
        { "@type": "LocationFeatureSpecification", name: "Restaurant",          value: true },
        { "@type": "LocationFeatureSpecification", name: "Banquet Hall",        value: true },
        { "@type": "LocationFeatureSpecification", name: "Wedding Venue",       value: true },
        { "@type": "LocationFeatureSpecification", name: "Conference Hall",     value: true },
        { "@type": "LocationFeatureSpecification", name: "Room Service",        value: true },
        { "@type": "LocationFeatureSpecification", name: "24/7 Reception",      value: true },
        { "@type": "LocationFeatureSpecification", name: "Parking",             value: true },
      ],
      servesCuisine: ["North Indian", "Vegetarian", "Chinese"],
      hasMap: "https://maps.google.com/?q=Bhabua+Kaimur+Bihar+821101+India",
      sameAs: ["https://facebook.com", "https://instagram.com"],
      areaServed: [
        { "@type": "City", name: "Bijnor", containedInPlace: { "@type": "State", name: "Uttar Pradesh" } },
        { "@type": "City", name: "Bhabua", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Kaimur", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Chainpur", containedInPlace: { "@type": "State", name: "Bihar" } },
        { "@type": "City", name: "Sasaram", containedInPlace: { "@type": "State", name: "Bihar" } },
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://lokgenius-hub.github.io/mysharda/#localbusiness",
      name: `${DEFAULT_CONFIG.hotel_name} — Hotel, Restaurant & Banquet`,
      telephone: DEFAULT_CONFIG.phone.replace(/[\s\-()]/g, ''),
      address: {
        "@type": "PostalAddress",
        streetAddress: "Behind Patnwar Petrol Pump, Ward No. 18, Near Panda Ji Pokhra",
        addressLocality: "Bhabua",
        addressRegion: "Bihar",
        postalCode: "821101",
        addressCountry: "IN",
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" }
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${HOTEL_NAME} — Hotel, Restaurant & Banquet`,
    template: `%s | ${HOTEL_NAME}`,
  },
  description: DEFAULT_CONFIG.description,
  keywords: [
    "Sharda Palace",
    "hotel near Bhabua", "hotel Bhabua", "best hotel Bhabua", "hotel in Bhabua Bihar",
    "hotel near Kaimur", "hotel Kaimur Bihar", "best hotel Kaimur",
    "hotel near Chainpur", "hotel Chainpur Bihar",
    "hotel near Sasaram", "hotel near Sasaram Bihar",
    "hotel Bhabua Road Bijnor", "hotel Bijnor UP",
    "hotel on Bhabua road", "nearest hotel from Bhabua",
    "nearest hotel Kaimur district", "nearest hotel from Chainpur",
    "marriage hall Bhabua", "banquet hall Kaimur", "wedding venue near Sasaram",
    "shaadi hall Bhabua Kaimur", "marriage hall Bijnor",
    "event hall Chainpur", "banquet hall near Kaimur Bihar",
    "reception hall Bhabua", "birthday hall Kaimur",
    "conference hall near Bhabua", "corporate event Kaimur",
    "restaurant Bhabua", "restaurant near Bhabua",
    "veg restaurant Kaimur", "restaurant near Kaimur Bihar",
    "dining near Chainpur", "North Indian food Bhabua",
    "family restaurant near Sasaram",
    "AC hotel Bhabua", "AC rooms near Kaimur",
    "luxury hotel near Sasaram Bihar", "best hotel near Kaimur Bihar",
    "Kaimur district hotel", "Rohtas Bihar hotel",
  ],
  openGraph: {
    title: `${HOTEL_NAME} — Hotel, Restaurant & Banquet`,
    description: DEFAULT_CONFIG.description,
    type: "website",
    url: SITE_URL,
    siteName: HOTEL_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${HOTEL_NAME} — Hotel, Restaurant & Banquet`,
    description: DEFAULT_CONFIG.description,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Per-tenant colour theme — overrides CSS var defaults in globals.css */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${PRIMARY_COLOR};
            --primary-light: ${PRIMARY_LIGHT};
            --bg-deep: ${BG_COLOR};
            --bg-card: ${CARD_COLOR};
          }
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
