"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingBag, Gavel, Bell, User, Menu, X, ChevronDown,
  Store, Package, LogOut, Settings, Shield, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

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

  // Sync user from server
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

  const verificationBadge = () => {
    if (!user) return null;
    if (user.verificationStatus === "FULLY_VERIFIED") {
      return <span className="ml-1 text-blue-500"><Shield className="w-3 h-3 inline" /></span>;
    }
    return null;
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        scrolled ? "bg-white shadow-md" : "bg-white border-b border-gray-200"
      )}
    >
      {/* Top bar */}
      <div className="bg-blue-800 text-white text-xs py-1.5 text-center">
        <span>Marketplace #1 de la República Dominicana | Verificación biométrica garantizada</span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-blue-800 text-lg leading-none">Warrior</span>
              <span className="font-bold text-red-600 text-lg leading-none">Market</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca cualquier cosa... (IA detecta lo que buscas)"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <Button type="submit" className="shrink-0 hidden sm:flex">
                Buscar
              </Button>
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                Comprar
              </Button>
            </Link>
            <Link href="/marketplace?listingType=AUCTION">
              <Button variant="ghost" size="sm" className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Gavel className="w-4 h-4" />
                Subastas
              </Button>
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/seller/new">
                  <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5">
                    <Store className="w-4 h-4" />
                    Vender
                  </Button>
                </Link>

                <button className="relative p-2 text-gray-500 hover:text-blue-700 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 leading-none">
                        {user.firstName}
                        {verificationBadge()}
                      </p>
                      <p className="text-xs text-gray-500">{user.role === "SELLER" ? "Vendedor" : "Comprador"}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.verificationStatus === "FULLY_VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                            <Shield className="w-3 h-3" /> Verificado
                          </span>
                        ) : (
                          <Link href="/auth/verify" onClick={() => setUserMenuOpen(false)}>
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 hover:bg-amber-100">
                              ⚠ Verificar identidad
                            </span>
                          </Link>
                        )}
                      </div>

                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Mi Perfil</span>
                      </Link>
                      <Link href="/buyer/orders" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Mis Compras</span>
                      </Link>
                      {user.role === "SELLER" && (
                        <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <Store className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Panel Vendedor</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left text-red-600"
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
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-700"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 flex flex-col gap-2">
            <Link href="/marketplace" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ShoppingBag className="w-4 h-4" /> Comprar
              </Button>
            </Link>
            <Link href="/marketplace?listingType=AUCTION" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600">
                <Gavel className="w-4 h-4" /> Subastas
              </Button>
            </Link>
            {user && (
              <Link href="/seller/new" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Store className="w-4 h-4" /> Vender
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
