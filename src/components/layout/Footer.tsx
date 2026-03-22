import Link from "next/link";
import { Shield, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#191919" }} className="text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-black" style={{ color: "#4A90D9" }}>Warrior</span>
              <span className="text-2xl font-black" style={{ color: "#CE1126" }}>Market</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              El marketplace más seguro de la República Dominicana. Compra y vende con verificación biométrica e inteligencia artificial.
            </p>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#4ade80" }}>
              <Shield className="w-3.5 h-3.5" />
              <span>Verificación biométrica certificada</span>
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="text-white font-semibold mb-4">Comprar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Todos los productos</Link></li>
              <li><Link href="/marketplace?listingType=AUCTION" className="hover:text-white transition-colors">Subastas activas</Link></li>
              <li><Link href="/marketplace?listingType=FIXED_PRICE" className="hover:text-white transition-colors">Compra inmediata</Link></li>
              <li><Link href="/buyer/orders" className="hover:text-white transition-colors">Mis compras</Link></li>
            </ul>
          </div>

          {/* Vender */}
          <div>
            <h4 className="text-white font-semibold mb-4">Vender</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/seller/new" className="hover:text-white transition-colors">Publicar producto</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-white transition-colors">Panel vendedor</Link></li>
              <li><Link href="/auth/verify" className="hover:text-white transition-colors">Verificar cuenta</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "#4A90D9" }} />
                <span>Santo Domingo, República Dominicana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: "#4A90D9" }} />
                <span>+1 (809) 000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color: "#4A90D9" }} />
                <span>soporte@warriormarket.do</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ backgroundColor: "#2a2a2a" }}>
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ backgroundColor: "#2a2a2a" }}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ backgroundColor: "#2a2a2a" }}>
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar with DR flag colors */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="h-0.5 w-24 mb-4 rounded-full" style={{ background: "linear-gradient(90deg, #002D62 50%, #CE1126 50%)" }} />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; 2024 WarriorMarket. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
              <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="/ayuda" className="hover:text-white transition-colors">Ayuda</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
