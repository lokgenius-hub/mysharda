import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Sharda Palace — Luxury Hotel & Banquet | Bijnor, UP",
  description:
    "Experience luxury stays, exquisite dining, and grand banquet halls at Sharda Palace, Bijnor. Book rooms, events, and restaurant tables online.",
  keywords: "Sharda Palace, hotel Bijnor, banquet hall, wedding venue, restaurant, Bijnor UP",
  openGraph: {
    title: "Sharda Palace — Luxury Hotel & Banquet",
    description: "Luxury stays and grand celebrations in Bijnor, UP",
    type: "website",
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
      </head>
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
