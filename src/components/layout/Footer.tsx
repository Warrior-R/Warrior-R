import Link from "next/link";
import { Facebook, Instagram, Twitter, Globe } from "lucide-react";

const footerLinks = {
  "Comprar": [
    { label: "Registro", href: "/auth/register" },
    { label: "Ayuda para comprar", href: "/marketplace" },
    { label: "Tiendas", href: "/marketplace" },
    { label: "Colecciones", href: "/marketplace" },
    { label: "WarriorMarket para Caridad", href: "/marketplace" },
    { label: "Tarjetas de Regalo", href: "/marketplace" },
  ],
  "Vender": [
    { label: "Empezar a vender", href: "/seller/new" },
    { label: "Cómo vender", href: "/seller/new" },
    { label: "Vendedores empresariales", href: "/seller/new" },
    { label: "Panel del vendedor", href: "/seller/dashboard" },
    { label: "Verificar identidad", href: "/auth/verify" },
  ],
  "Sobre WarriorMarket": [
    { label: "Información de la empresa", href: "/" },
    { label: "Noticias", href: "/" },
    { label: "Inversores", href: "/" },
    { label: "Carreras", href: "/" },
    { label: "Diversidad e Inclusión", href: "/" },
    { label: "Políticas", href: "/" },
  ],
  "Ayuda y Contacto": [
    { label: "Centro del Vendedor", href: "/seller/dashboard" },
    { label: "Contáctanos", href: "/" },
    { label: "Devoluciones", href: "/buyer/orders" },
    { label: "Garantía WarriorMarket", href: "/" },
    { label: "Centro de Seguridad", href: "/auth/verify" },
  ],
  "Comunidad": [
    { label: "Anuncios", href: "/" },
    { label: "Comunidad WarriorMarket", href: "/" },
    { label: "Blog para Negocios", href: "/" },
    { label: "Afiliados", href: "/" },
  ],
};

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#F5F5F5", borderTop: "1px solid #e0e0e0" }}>
      {/* Main footer links */}
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-bold text-gray-900 text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-gray-600 hover:text-[#002D62] hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stay connected */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">Mantenerse conectado</p>
              <div className="flex items-center gap-3">
                <a href="#" className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#002D62] hover:underline">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
                <a href="#" className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#002D62] hover:underline">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a href="#" className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#002D62] hover:underline">
                  <Twitter className="w-4 h-4" /> X (Twitter)
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-xs text-gray-600 border border-gray-400 px-3 py-2 rounded-lg hover:border-gray-600 transition-colors">
                <span>🇩🇴</span>
                República Dominicana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div style={{ borderTop: "1px solid #e0e0e0", backgroundColor: "#EBEBEB" }}>
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            Copyright © 1995-2024 WarriorMarket RD. Todos los Derechos Reservados.{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Accesibilidad</Link>,{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Acuerdo de Usuario</Link>,{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Privacidad</Link>,{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Pagos</Link>,{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Cookies</Link>,{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">Aviso de Privacidad</Link>{" "}
            y{" "}
            <Link href="/" className="hover:underline hover:text-[#002D62]">AdChoice</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
