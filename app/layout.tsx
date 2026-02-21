import type { Metadata } from "next";
import { Lacquer, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const lacquer = Lacquer({
  variable: "--font-lacquer",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "My Friend's Art",
  description: "Meaningful art made by someone's friend.",
  icons: {
    icon: "/logo-small.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${lacquer.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
