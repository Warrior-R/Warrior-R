"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingBag, Gavel, Bell, User, Menu, X, ChevronDown,
  Store, Package, LogOut, Shield, Heart, Tag
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Electrónica", slug: "electronica", emoji: "💻" },
  { label: "Vehículos", slug: "vehiculos", emoji: "🚗" },
  { label: "Inmuebles", slug: "inmuebles", emoji: "🏠" },
  { label: "Ropa", slug: "ropa-y-accesorios", emoji: "👗" },
  { label: "Electrodomésticos", slug: "electrodomesticos", emoji: "📺" },
  { label: "Deportes", slug: "deportes", emoji: "⚽" },
  { label: "Juguetes", slug: "juguetes", emoji: "🧸" },
  { label: "Servicios", slug: "servicios", emoji: "🔧" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const { setUser } = useAuthStore.getState();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className={cn("sticky top-0 z-50 transition-all duration-200", scrolled ? "shadow-lg" : "")}>
      {/* DR flag color stripe */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #002D62 50%, #CE1126 50%)" }} />

      {/* Main header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-2xl font-black tracking-tight" style={{ color: "#002D62" }}>Warrior</span>
              <span className="text-2xl font-black tracking-tight" style={{ color: "#CE1126" }}>Market</span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca productos, marcas y más..."
                  className="flex-1 px-4 py-2.5 border-2 border-r-0 rounded-l-full text-sm focus:outline-none transition-colors"
                  style={{ borderColor: "#002D62" }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-r-full text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#002D62" }}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link href="/seller/new">
                    <button
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#CE1126" }}
                    >
                      <Tag className="w-4 h-4" />
                      Vender
                    </button>
                  </Link>

                  <button className="p-2 text-gray-500 hover:text-[#002D62] transition-colors hidden sm:flex">
                    <Heart className="w-5 h-5" />
                  </button>

                  <button className="relative p-2 text-gray-500 hover:text-[#002D62] transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#CE1126" }} />
                  </button>

                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: "#002D62" }}
                      >
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-xs text-gray-500">Hola,</p>
                        <p className="text-sm font-semibold text-gray-900 leading-none flex items-center gap-1">
                          {user.firstName}
                          {user.verificationStatus === "FULLY_VERIFIED" && (
                            <Shield className="w-3 h-3 inline" style={{ color: "#002D62" }} />
                          )}
                        </p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.verificationStatus === "FULLY_VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full mt-1.5" style={{ backgroundColor: "#002D62" }}>
                              <Shield className="w-3 h-3" /> Verificado
                            </span>
                          ) : (
                            <Link href="/auth/verify" onClick={() => setUserMenuOpen(false)}>
                              <span className="inline-flex items-center gap-1 text-xs text-white px-2 py-0.5 rounded-full mt-1.5 cursor-pointer" style={{ backgroundColor: "#CE1126" }}>
                                ⚠ Verificar identidad
                              </span>
                            </Link>
                          )}
                        </div>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Mi Perfil</span>
                        </Link>
                        <Link href="/buyer/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Mis Compras</span>
                        </Link>
                        {user.role === "SELLER" && (
                          <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <Store className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">Panel Vendedor</span>
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                            style={{ color: "#CE1126" }}
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <button className="text-sm font-medium text-gray-700 hover:text-[#002D62] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      Iniciar Sesión
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button
                      className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#002D62" }}
                    >
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}

              <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-600">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div style={{ backgroundColor: "#002D62" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0.5 overflow-x-auto py-0.5" style={{ scrollbarWidth: "none" }}>
            <Link href="/marketplace">
              <div className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold whitespace-nowrap hover:bg-white/10 rounded transition-colors">
                <ShoppingBag className="w-4 h-4" /> Todo
              </div>
            </Link>
            <Link href="/marketplace?listingType=AUCTION">
              <div className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap hover:bg-white/10 rounded transition-colors" style={{ color: "#FFD700" }}>
                <Gavel className="w-4 h-4" /> 🔴 Subastas en Vivo
              </div>
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/marketplace?category=${cat.slug}`}>
                <div className="flex items-center gap-1.5 px-3 py-2.5 text-white/80 text-sm whitespace-nowrap hover:bg-white/10 rounded transition-colors hover:text-white">
                  <span>{cat.emoji}</span> {cat.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-3 px-4 flex flex-col gap-1">
          <Link href="/marketplace" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2 py-2 text-gray-700">
              <ShoppingBag className="w-4 h-4" /> Comprar
            </div>
          </Link>
          <Link href="/marketplace?listingType=AUCTION" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2 py-2 font-medium" style={{ color: "#CE1126" }}>
              <Gavel className="w-4 h-4" /> Subastas en Vivo
            </div>
          </Link>
          {user && (
            <Link href="/seller/new" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-2 py-2 font-medium" style={{ color: "#002D62" }}>
                <Tag className="w-4 h-4" /> Vender
              </div>
            </Link>
          )}
          <div className="border-t border-gray-100 pt-2 mt-1 grid grid-cols-2 gap-1">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/marketplace?category=${cat.slug}`} onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-1.5 py-1.5 text-gray-600 text-sm">
                  <span>{cat.emoji}</span> {cat.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
