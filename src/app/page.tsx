import Link from "next/link";
import {
  Shield, Gavel, Zap, Brain, Star, ArrowRight, ShoppingBag,
  TrendingUp, Users, Package, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatCurrency, timeRemaining } from "@/lib/utils";
import Image from "next/image";

async function getFeaturedData() {
  try {
    const [featuredProducts, activeAuctions, categories, stats] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", listingType: "FIXED_PRICE" },
        include: {
          seller: { select: { firstName: true, lastName: true, rating: true } },
          category: { select: { name: true } },
        },
        orderBy: { views: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", OR: [{ listingType: "AUCTION" }, { listingType: "BOTH" }] },
        include: {
          auction: { include: { _count: { select: { bids: true } } } },
          seller: { select: { firstName: true, lastName: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.category.findMany({
        where: { parentId: null },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
        take: 12,
      }),
      prisma.user.count({ where: { verificationStatus: "FULLY_VERIFIED" } }),
    ]);

    return { featuredProducts, activeAuctions, categories, stats };
  } catch {
    return { featuredProducts: [], activeAuctions: [], categories: [], stats: 0 };
  }
}

const categoryIcons: Record<string, string> = {
  "Electrónica": "💻",
  "Vehículos": "🚗",
  "Inmuebles": "🏠",
  "Ropa y Accesorios": "👗",
  "Electrodomésticos": "🏠",
  "Deportes": "⚽",
  "Juguetes": "🧸",
  "Libros": "📚",
  "Arte": "🎨",
  "Servicios": "🔧",
  "Animales": "🐾",
  "General": "📦",
};

export default async function HomePage() {
  const { featuredProducts, activeAuctions, categories, stats } = await getFeaturedData();

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6 border border-white/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Verificación biométrica + IA | Solo en RD</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              El Marketplace más
              <span className="text-yellow-300"> Seguro</span> de la
              <br />República Dominicana
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Compra y vende con total confianza. Verificamos a todos nuestros usuarios con cédula y biometría.
              Subastas en tiempo real y compras instantáneas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/marketplace">
                <Button size="xl" className="bg-white text-blue-800 hover:bg-blue-50 gap-2 font-bold w-full sm:w-auto">
                  <ShoppingBag className="w-5 h-5" />
                  Explorar Marketplace
                </Button>
              </Link>
              <Link href="/seller/new">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                  <Gavel className="w-5 h-5" />
                  Empezar a Vender
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-yellow-300">{stats.toLocaleString()}+</p>
                <p className="text-sm text-blue-200">Usuarios verificados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-300">{featuredProducts.length + activeAuctions.length}+</p>
                <p className="text-sm text-blue-200">Productos activos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-300">{activeAuctions.length}+</p>
                <p className="text-sm text-blue-200">Subastas en vivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Verificación Biométrica", desc: "Cédula + rostro/huella", color: "blue" },
              { icon: Brain, title: "IA Integrada", desc: "Detecta categorías automáticamente", color: "purple" },
              { icon: Gavel, title: "Subastas en Vivo", desc: "Pujas en tiempo real", color: "red" },
              { icon: Zap, title: "Compra Rápida", desc: "Precio fijo, compra instantánea", color: "green" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-200 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  color === "blue" ? "bg-blue-100" :
                  color === "purple" ? "bg-purple-100" :
                  color === "red" ? "bg-red-100" : "bg-green-100"
                }`}>
                  <Icon className={`w-6 h-6 ${
                    color === "blue" ? "text-blue-700" :
                    color === "purple" ? "text-purple-700" :
                    color === "red" ? "text-red-700" : "text-green-700"
                  }`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
            <Link href="/marketplace" className="text-blue-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/marketplace?category=${cat.slug}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all card-hover group">
                  <div className="text-3xl mb-2">{categoryIcons[cat.name] || "📦"}</div>
                  <p className="text-xs font-medium text-gray-900 group-hover:text-blue-700 leading-tight">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(cat as any)._count?.products || 0}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active Auctions */}
      {activeAuctions.length > 0 && (
        <section className="bg-red-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900">Subastas en Vivo</h2>
              </div>
              <Link href="/marketplace?listingType=AUCTION">
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                  Ver todas <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeAuctions.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`}>
                  <div className="bg-white rounded-xl border border-red-200 overflow-hidden card-hover group">
                    <div className="relative h-48 bg-gray-100">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="auction-badge text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> SUBASTA
                        </span>
                      </div>
                      {product.auction && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          ⏱ {timeRemaining(product.auction.endTime)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Puja actual</p>
                          <p className="font-bold text-red-600 text-lg">
                            {formatCurrency(Number(product.auction?.currentPrice || product.price))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Pujas</p>
                          <p className="font-semibold text-gray-900">
                            {(product.auction as any)?._count?.bids || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
            <Link href="/marketplace" className="text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
                  <div className="relative h-44 bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="buy-now-badge text-white text-xs px-2 py-1 rounded-full font-semibold">
                        VENTA RÁPIDA
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-800 text-base">{formatCurrency(Number(product.price))}</p>
                      {product.seller?.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-gray-600">{product.seller.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Únete a miles de dominicanos que ya compran y venden de forma segura.
            La verificación es rápida y gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="xl" className="bg-white text-blue-800 hover:bg-blue-50 font-bold gap-2 w-full sm:w-auto">
                <Users className="w-5 h-5" />
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                <Package className="w-5 h-5" />
                Explorar sin cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
