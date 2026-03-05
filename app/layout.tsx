import type { Metadata } from "next";
import { Lacquer, Outfit } from "next/font/google";
import "./globals.css";
import Layout from "@/components/organisms/Layout";
import QueryProvider from "@/components/providers/QueryProvider";

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
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
      </body>
    </html>
  );
}
