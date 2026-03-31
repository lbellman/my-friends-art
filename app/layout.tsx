import type { Metadata } from "next";
import { Lacquer, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const maintenanceActive = process.env.MAINTENANCE_MODE === "true";
  const isMaintenanceRoute = pathname === "/maintenance";

  if (maintenanceActive && isMaintenanceRoute) {
    return (
      <html lang="en">
        <body className={`${outfit.variable} ${lacquer.variable} antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${outfit.variable} ${lacquer.variable} antialiased`}>
        <QueryProvider>
          <Layout>{children}</Layout>
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
