"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, Bell, ChevronDown, Menu, X,
  Store, Package, LogOut, Shield, Heart, Tag, User,
  Camera, Grid3X3
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Todas las Categorías", "Electrónica", "Vehículos", "Inmuebles",
  "Ropa y Accesorios", "Electrodomésticos", "Deportes", "Juguetes",
  "Libros y Arte", "Servicios", "Animales",
];

const NAV_LINKS = [
  { label: "WarriorLive 🔴", href: "/marketplace?listingType=AUCTION", highlight: true },
  { label: "Guardados", href: "/buyer/orders" },
  { label: "Vehículos", href: "/marketplace?category=vehiculos" },
  { label: "Electrónica", href: "/marketplace?category=electronica" },
  { label: "Coleccionables", href: "/marketplace?category=general" },
  { label: "Hogar y jardín", href: "/marketplace?category=electrodomesticos" },
  { label: "Ropa y accesorios", href: "/marketplace?category=ropa-y-accesorios" },
  { label: "Juguetes", href: "/marketplace?category=juguetes" },
  { label: "Deportes", href: "/marketplace?category=deportes" },
  { label: "Inmuebles", href: "/marketplace?category=inmuebles" },
  { label: "Servicios", href: "/marketplace?category=servicios" },
];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas las Categorías");
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [shopByOpen, setShopByOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const userRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopByOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const { setUser } = useAuthStore.getState();
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data.user); else setUser(null); })
      .catch(() => setUser(null));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory !== "Todas las Categorías") params.set("category", selectedCategory.toLowerCase().replace(/\s+/g, "-"));
    router.push(`/marketplace?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Tier 1: Utility bar */}
      <div style={{ backgroundColor: "#F5F5F5", borderBottom: "1px solid #e0e0e0" }}>
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-9 text-xs text-gray-600">
          {/* Left */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 font-medium hover:text-[#002D62] transition-colors"
                >
                  Hola, {user.firstName}!
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white shadow-xl border border-gray-200 rounded-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.verificationStatus === "FULLY_VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: "#002D62" }}>
                          <Shield className="w-3 h-3" /> Verificado
                        </span>
                      ) : (
                        <Link href="/auth/verify" onClick={() => setUserMenuOpen(false)}>
                          <span className="inline-flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full mt-1 cursor-pointer" style={{ backgroundColor: "#CE1126" }}>
                            ⚠ Verificar identidad
                          </span>
                        </Link>
                      )}
                    </div>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" /> Mi Perfil
                    </Link>
                    <Link href="/buyer/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                      <Package className="w-4 h-4 text-gray-400" /> Mis Compras
                    </Link>
                    {user.role === "SELLER" && (
                      <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                        <Store className="w-4 h-4 text-gray-400" /> Panel Vendedor
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm w-full text-left" style={{ color: "#CE1126" }}>
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span>
                <Link href="/auth/login" className="font-medium hover:text-[#002D62] hover:underline">Iniciar sesión</Link>
              </span>
            )}
            <Link href="/marketplace" className="hover:text-[#002D62] hover:underline">Ofertas</Link>
            <Link href="/marketplace" className="hover:text-[#002D62] hover:underline">Marcas</Link>
            <Link href="/auth/register" className="hover:text-[#002D62] hover:underline">Tarjetas de regalo</Link>
            <span className="hover:text-[#002D62] hover:underline cursor-pointer">Ayuda y Contacto</span>
          </div>
          {/* Right */}
          <div className="flex items-center gap-4">
            <Link href="/seller/new" className="hover:text-[#002D62] hover:underline">Vender</Link>
            <div className="relative">
              <button
                onClick={() => setWatchlistOpen(!watchlistOpen)}
                className="flex items-center gap-1 hover:text-[#002D62]"
              >
                Lista de seguimiento <ChevronDown className="w-3 h-3" />
              </button>
              {watchlistOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl border border-gray-200 rounded-lg py-2 z-50 text-sm">
                  <Link href="/buyer/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Mis compras</Link>
                  <Link href="/marketplace?listingType=AUCTION" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Subastas guardadas</Link>
                </div>
              )}
            </div>
            <div className="relative" ref={userRef}>
              {user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 hover:text-[#002D62]"
                >
                  Mi Warrior <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <Link href="/auth/register" className="hover:text-[#002D62] hover:underline">Registrarse</Link>
              )}
            </div>
            <button className="relative hover:text-[#002D62]">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 text-white text-[9px] flex items-center justify-center rounded-full" style={{ backgroundColor: "#CE1126" }}>1</span>
            </button>
            <Link href="/buyer/orders" className="relative hover:text-[#002D62]">
              <ShoppingCart className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Logo + Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-3 h-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-2">
            <span className="text-[28px] font-black leading-none" style={{ color: "#002D62" }}>W</span>
            <span className="text-[28px] font-black leading-none" style={{ color: "#CE1126" }}>a</span>
            <span className="text-[28px] font-black leading-none" style={{ color: "#002D62" }}>r</span>
            <span className="text-[28px] font-black leading-none" style={{ color: "#CE1126" }}>r</span>
            <span className="text-[28px] font-black leading-none" style={{ color: "#002D62" }}>ior</span>
          </Link>

          {/* Shop by category */}
          <div className="relative hidden md:block" ref={shopRef}>
            <button
              onClick={() => setShopByOpen(!shopByOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[#002D62] whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              Comprar por<br className="hidden" /> categoría
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {shopByOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white shadow-xl border border-gray-200 rounded-lg py-2 z-50">
                {CATEGORIES.slice(1).map(cat => (
                  <Link key={cat}
                    href={`/marketplace?category=${cat.toLowerCase().replace(/\s+y\s+/g, "-").replace(/\s+/g, "-")}`}
                    onClick={() => setShopByOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#002D62]"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center border-2 rounded-full overflow-hidden" style={{ borderColor: "#002D62" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar cualquier cosa..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
            />
            <button type="button" className="px-3 py-2.5 text-gray-400 hover:text-gray-600 border-l border-gray-200 bg-white">
              <Camera className="w-4 h-4" />
            </button>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-xs text-gray-600 border-l border-gray-200 bg-gray-50 outline-none hidden sm:block cursor-pointer"
              style={{ maxWidth: "140px" }}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#002D62" }}
            >
              Buscar
            </button>
          </form>

          {/* Advanced */}
          <Link href="/marketplace" className="text-xs text-gray-600 hover:underline hover:text-[#002D62] whitespace-nowrap hidden lg:block">
            Avanzado
          </Link>

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tier 3: Category nav */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center overflow-x-auto gap-0" style={{ scrollbarWidth: "none" }}>
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href}>
                <div className={cn(
                  "px-3 py-3 text-xs whitespace-nowrap hover:underline transition-colors",
                  link.highlight ? "font-semibold" : "text-gray-700"
                )} style={link.highlight ? { color: "#CE1126" } : {}}>
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile expanded menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-2">
          <form onSubmit={handleSearch} className="flex border-2 rounded-full overflow-hidden mb-2" style={{ borderColor: "#002D62" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="px-4 py-2 text-white text-sm font-semibold" style={{ backgroundColor: "#002D62" }}>
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="grid grid-cols-2 gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
                <div className="py-2 text-sm text-gray-700 hover:text-[#002D62]">{link.label}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
