import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "WarriorMarket - El Marketplace de la República Dominicana",
  description:
    "Compra y vende con seguridad. Subastas, compras rápidas y verificación biométrica. El marketplace #1 de República Dominicana.",
  keywords: "marketplace, dominicana, comprar, vender, subasta, RD, Santo Domingo",
  openGraph: {
    title: "WarriorMarket - Marketplace República Dominicana",
    description: "Compra y vende con total seguridad en la RD",
    locale: "es_DO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
