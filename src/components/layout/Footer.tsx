import Link from "next/link";
import { Gavel, Shield, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Gavel className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">WarriorMarket</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              El marketplace más seguro de la República Dominicana. Compra y vende con verificación biométrica e inteligencia artificial.
            </p>
            <div className="flex items-center gap-1 text-xs text-green-400">
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
              <li><Link href="/seller/orders" className="hover:text-white transition-colors">Mis ventas</Link></li>
              <li><Link href="/auth/verify" className="hover:text-white transition-colors">Verificar cuenta</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Santo Domingo, República Dominicana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+1 (809) 000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>soporte@warriormarket.do</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-blue-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; 2024 WarriorMarket. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/ayuda" className="hover:text-white transition-colors">Ayuda</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
