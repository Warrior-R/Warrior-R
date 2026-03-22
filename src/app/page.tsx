import Link from "next/link";
import {
  Shield, Gavel, Zap, Brain, Star, ArrowRight, ShoppingBag,
  Users, Package, ChevronRight, TrendingUp, Tag, Clock
} from "lucide-react";
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
  "Electrónica": "💻", "Vehículos": "🚗", "Inmuebles": "🏠",
  "Ropa y Accesorios": "👗", "Electrodomésticos": "📺", "Deportes": "⚽",
  "Juguetes": "🧸", "Libros": "📚", "Arte": "🎨",
  "Servicios": "🔧", "Animales": "🐾", "General": "📦",
};

export default async function HomePage() {
  const { featuredProducts, activeAuctions, categories, stats } = await getFeaturedData();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>

      {/* Hero Banner */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #002D62 0%, #003F8A 55%, #CE1126 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-5 border border-white/20">
                <Shield className="w-3.5 h-3.5 text-green-300" />
                <span>Verificación biométrica · Solo en RD</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                El Marketplace #1 de la<br />
                <span style={{ color: "#FFD700" }}>República Dominicana</span>
              </h1>
              <p className="text-blue-100 text-lg mb-6 max-w-lg">
                Compra y vende con total confianza. Verificamos a todos nuestros usuarios con cédula y biometría.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketplace">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 bg-white" style={{ color: "#002D62" }}>
                    <ShoppingBag className="w-4 h-4" />
                    Explorar Marketplace
                  </button>
                </Link>
                <Link href="/seller/new">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white border-2 border-white/50 hover:bg-white/10 transition-colors">
                    <Tag className="w-4 h-4" />
                    Empezar a Vender
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-white/20">
                <div>
                  <p className="text-2xl font-black" style={{ color: "#FFD700" }}>{stats.toLocaleString()}+</p>
                  <p className="text-xs text-blue-200">Usuarios verificados</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: "#FFD700" }}>{featuredProducts.length + activeAuctions.length}+</p>
                  <p className="text-xs text-blue-200">Productos activos</p>
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: "#FFD700" }}>{activeAuctions.length}+</p>
                  <p className="text-xs text-blue-200">Subastas en vivo</p>
                </div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3 w-72 shrink-0">
              {[
                { icon: Shield, label: "Verificación Biométrica", sub: "Cédula + rostro", bg: "#001A3D" },
                { icon: Brain, label: "IA Integrada", sub: "Auto-categorización", bg: "#001A3D" },
                { icon: Gavel, label: "Subastas en Vivo", sub: "Pujas en tiempo real", bg: "#A50E1F" },
                { icon: Zap, label: "Compra Rápida", sub: "Precio fijo", bg: "#001A3D" },
              ].map(({ icon: Icon, label, sub, bg }) => (
                <div key={label} className="rounded-xl p-4 text-white text-center" style={{ backgroundColor: bg }}>
                  <Icon className="w-6 h-6 mx-auto mb-2 opacity-90" />
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-xs opacity-60 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#191919" }}>Compra por categoría</h2>
              <Link href="/marketplace" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: "#002D62" }}>
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/marketplace?category=${cat.slug}`}>
                  <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="text-3xl mb-2">{categoryIcons[cat.name] || "📦"}</div>
                    <p className="text-xs font-medium text-gray-800 group-hover:text-[#002D62] leading-tight">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(cat as any)._count?.products || 0}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Auctions */}
      {activeAuctions.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: "#CE1126" }}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Subastas en Vivo
              </div>
              <Link href="/marketplace?listingType=AUCTION">
                <button className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: "#002D62" }}>
                  Ver todas <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeAuctions.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
                    <div className="relative h-48 bg-gray-100">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="auction-badge text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> SUBASTA
                        </span>
                      </div>
                      {product.auction && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeRemaining(product.auction.endTime)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Puja actual</p>
                          <p className="font-bold text-lg" style={{ color: "#CE1126" }}>
                            {formatCurrency(Number(product.auction?.currentPrice || product.price))}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">{(product.auction as any)?._count?.bids || 0} pujas</p>
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
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#191919" }}>Productos Destacados</h2>
              <Link href="/marketplace" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: "#002D62" }}>
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/marketplace/${product.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
                    <div className="relative h-44 bg-gray-100">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="buy-now-badge text-white text-xs px-2 py-1 rounded-full font-semibold">COMPRA YA</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#002D62] transition-colors">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-base" style={{ color: "#002D62" }}>{formatCurrency(Number(product.price))}</p>
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
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "100% Verificado", desc: "Cédula + biometría obligatoria" },
              { icon: Brain, title: "IA Integrada", desc: "Detecta categorías automáticamente" },
              { icon: Gavel, title: "Subastas en Vivo", desc: "Pujas en tiempo real" },
              { icon: TrendingUp, title: "Mercado RD #1", desc: "Miles de dominicanos confían en nosotros" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EEF2FF" }}>
                  <Icon className="w-5 h-5" style={{ color: "#002D62" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14" style={{ background: "linear-gradient(135deg, #002D62 0%, #CE1126 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-black mb-3">¿Listo para empezar?</h2>
          <p className="text-blue-100 mb-7">
            Únete a miles de dominicanos que compran y venden de forma segura. La verificación es rápida y gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-white hover:bg-gray-100 transition-colors" style={{ color: "#002D62" }}>
                <Users className="w-4 h-4" />
                Crear cuenta gratis
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white border-2 border-white/40 hover:bg-white/10 transition-colors">
                <Package className="w-4 h-4" />
                Explorar sin cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
