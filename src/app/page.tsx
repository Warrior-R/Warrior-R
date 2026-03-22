import Link from "next/link";
import {
  Shield, Gavel, Star, ArrowRight, ShoppingBag,
  Users, Package, ChevronRight, TrendingUp, Tag, Clock, Heart, Zap, Brain
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency, timeRemaining } from "@/lib/utils";
import Image from "next/image";

async function getFeaturedData() {
  try {
    const [featuredProducts, activeAuctions, categories, stats, recentProducts] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", listingType: "FIXED_PRICE" },
        include: {
          seller: { select: { firstName: true, lastName: true, rating: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { views: "desc" },
        take: 12,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", OR: [{ listingType: "AUCTION" }, { listingType: "BOTH" }] },
        include: {
          auction: { include: { _count: { select: { bids: true } } } },
          seller: { select: { firstName: true, lastName: true, rating: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.category.findMany({
        where: { parentId: null },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
        take: 12,
      }),
      prisma.user.count({ where: { verificationStatus: "FULLY_VERIFIED" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: {
          seller: { select: { firstName: true, lastName: true, rating: true } },
          category: { select: { name: true } },
          auction: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);
    return { featuredProducts, activeAuctions, categories, stats, recentProducts };
  } catch {
    return { featuredProducts: [], activeAuctions: [], categories: [], stats: 0, recentProducts: [] };
  }
}

const categoryData: Record<string, { emoji: string; slug: string }> = {
  "Electrónica":       { emoji: "💻", slug: "electronica" },
  "Vehículos":         { emoji: "🚗", slug: "vehiculos" },
  "Inmuebles":         { emoji: "🏠", slug: "inmuebles" },
  "Ropa y Accesorios": { emoji: "👗", slug: "ropa-y-accesorios" },
  "Electrodomésticos": { emoji: "📺", slug: "electrodomesticos" },
  "Deportes":          { emoji: "⚽", slug: "deportes" },
  "Juguetes":          { emoji: "🧸", slug: "juguetes" },
  "Libros":            { emoji: "📚", slug: "libros" },
  "Arte":              { emoji: "🎨", slug: "arte" },
  "Servicios":         { emoji: "🔧", slug: "servicios" },
  "Animales":          { emoji: "🐾", slug: "animales" },
  "General":           { emoji: "📦", slug: "general" },
};

function ProductMiniCard({ product, showHeart = true }: { product: any; showHeart?: boolean }) {
  const isAuction = product.listingType === "AUCTION" || product.listingType === "BOTH";
  const price = isAuction ? product.auction?.currentPrice : product.price;
  return (
    <Link href={`/marketplace/${product.id}`}>
      <div className="group cursor-pointer">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
          {showHeart && (
            <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-800 line-clamp-2 leading-tight font-medium">{product.title}</p>
        <p className="text-sm font-bold mt-1" style={{ color: "#002D62" }}>
          {formatCurrency(Number(price || 0))}
        </p>
      </div>
    </Link>
  );
}

function ProductScrollCard({ product }: { product: any }) {
  const isAuction = product.listingType === "AUCTION" || product.listingType === "BOTH";
  const price = isAuction ? product.auction?.currentPrice : product.price;
  const originalPrice = Number(price || 0) * 1.15;
  return (
    <Link href={`/marketplace/${product.id}`}>
      <div className="w-[200px] shrink-0 group cursor-pointer">
        <div className="relative h-[200px] bg-gray-100 rounded-lg overflow-hidden mb-2">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
          )}
          <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-800 line-clamp-2 leading-tight">{product.title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-sm font-bold" style={{ color: "#002D62" }}>{formatCurrency(Number(price || 0))}</p>
          <p className="text-xs text-gray-400 line-through">{formatCurrency(originalPrice)}</p>
        </div>
        {isAuction && product.auction?.endTime && (
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#CE1126" }}>
            <Clock className="w-3 h-3" /> {timeRemaining(product.auction.endTime)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { featuredProducts, activeAuctions, categories, stats, recentProducts } = await getFeaturedData();
  const deals = featuredProducts.slice(0, 4);
  const keepShopping = [...featuredProducts, ...activeAuctions].slice(0, 10);
  const watchedItems = activeAuctions.slice(0, 6);

  return (
    <div style={{ backgroundColor: "#F5F5F5", minHeight: "100vh" }}>

      {/* ── 4-PANEL TOP SECTION ── */}
      <div className="max-w-[1280px] mx-auto px-4 pt-5 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Panel 1: Destacados (eBay: Recently viewed) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Destacados</h2>
              <Link href="/marketplace" className="text-xs hover:underline" style={{ color: "#002D62" }}>Ver todo</Link>
            </div>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {featuredProducts.slice(0, 4).map(p => <ProductMiniCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
          </div>

          {/* Panel 2: Ofertas de Hoy (eBay: Today's Deals) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Ofertas de Hoy</h2>
              <Link href="/marketplace" className="text-xs hover:underline" style={{ color: "#002D62" }}>Ver ahora</Link>
            </div>
            {deals.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {deals.map(p => <ProductMiniCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Tag className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Próximamente ofertas</p>
                <Link href="/marketplace" className="text-xs mt-2 hover:underline" style={{ color: "#002D62" }}>Ver marketplace</Link>
              </div>
            )}
          </div>

          {/* Panel 3: Nuevo para ti (eBay: New for you) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Nuevo para ti</h2>
              <Link href="/marketplace" className="text-xs hover:underline" style={{ color: "#002D62" }}>Ver todo</Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentProducts.slice(0, 3).map(p => (
                <Link key={p.id} href={`/marketplace/${p.id}`}>
                  <div className="flex items-center gap-3 group">
                    <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "#CE1126" }}>
                        Oferta vendedor: {formatCurrency(Number(p.price))}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{p.title}</p>
                      {p.seller?.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          {p.seller.rating.toFixed(1)} · Obtén {Math.floor(Math.random()*10)+5}% desc...
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {recentProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Explora para recibir recomendaciones</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel 4: El Hub de Subastas (eBay: The Auction Hub) */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg, #002D62 0%, #003F8A 50%, #CE1126 100%)", minHeight: "280px" }}>
            <div className="p-5 text-white h-full flex flex-col justify-between" style={{ minHeight: "280px" }}>
              <div>
                <p className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-wider">En vivo ahora</p>
                <h2 className="text-xl font-black leading-tight mb-2">El Hub de<br />Subastas</h2>
                <p className="text-xs opacity-80 leading-relaxed">
                  Encuentra las mejores subastas semanales de vendedores verificados de toda la RD.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs opacity-70 mb-3">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {activeAuctions.length} subastas activas ahora
                </div>
                <Link href="/marketplace?listingType=AUCTION">
                  <button className="px-5 py-2.5 rounded-full text-sm font-bold bg-white hover:bg-gray-100 transition-colors" style={{ color: "#002D62" }}>
                    Pujar ahora
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEGUIR COMPRANDO (horizontal scroll) ── */}
      {keepShopping.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 py-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Seguir comprando</h2>
              <Link href="/marketplace" className="text-sm hover:underline flex items-center gap-1" style={{ color: "#002D62" }}>
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {keepShopping.map(p => <ProductScrollCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER PROMOCIONAL ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-5">
        <div className="rounded-2xl overflow-hidden relative h-[220px]" style={{ background: "linear-gradient(135deg, #002D62 0%, #003F8A 60%, #001A3D 100%)" }}>
          <div className="absolute inset-0 flex items-center justify-between px-10">
            <div className="text-white max-w-md">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-widest mb-2">Solo en WarriorMarket</p>
              <h2 className="text-3xl font-black leading-tight mb-2">
                Verificación<br />
                <span style={{ color: "#FFD700" }}>100% Segura</span>
              </h2>
              <p className="text-sm opacity-80 mb-4">
                Compramos y vendemos con cédula + biometría. El único marketplace verificado de la RD.
              </p>
              <Link href="/auth/register">
                <button className="px-6 py-2.5 rounded-full text-sm font-bold bg-white hover:bg-gray-100 transition-colors" style={{ color: "#002D62" }}>
                  Crear cuenta gratis
                </button>
              </Link>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-white">
              {[
                { n: `${stats}+`, l: "Usuarios verificados" },
                { n: "100%", l: "Transacciones seguras" },
                { n: "RD #1", l: "Marketplace local" },
              ].map(({ n, l }) => (
                <div key={l} className="text-center px-5 py-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <p className="text-2xl font-black" style={{ color: "#FFD700" }}>{n}</p>
                  <p className="text-xs opacity-70 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SUBASTAS EN VIVO (eBay: eBay Live) ── */}
      {activeAuctions.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 pb-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  WarriorLive
                  <span className="text-xs text-white px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#CE1126" }}>EN VIVO</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Las mejores subastas activas ahora mismo</p>
              </div>
              <Link href="/marketplace?listingType=AUCTION" className="text-sm hover:underline flex items-center gap-1" style={{ color: "#002D62" }}>
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pt-4 pb-2" style={{ scrollbarWidth: "thin" }}>
              {activeAuctions.map(p => (
                <Link key={p.id} href={`/marketplace/${p.id}`}>
                  <div className="w-[220px] shrink-0 group cursor-pointer">
                    <div className="relative h-[160px] bg-gray-100 rounded-xl overflow-hidden mb-2">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                      )}
                      <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1" style={{ backgroundColor: "#CE1126" }}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        SUBASTA
                      </div>
                      {p.auction?.endTime && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeRemaining(p.auction.endTime)}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{p.seller?.firstName} {p.seller?.lastName}</p>
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 mt-0.5">{p.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold" style={{ color: "#CE1126" }}>
                        {formatCurrency(Number(p.auction?.currentPrice || p.price))}
                      </p>
                      <p className="text-xs text-gray-400">{(p.auction as any)?._count?.bids || 0} pujas</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ARTÍCULOS SEGUIDOS / NUEVOS (eBay: Your watched items) ── */}
      {watchedItems.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 pb-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recién publicados</h2>
              <Link href="/marketplace" className="text-sm hover:underline flex items-center gap-1" style={{ color: "#002D62" }}>
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {watchedItems.map(p => <ProductScrollCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── EXPLORAR CATEGORÍAS ── */}
      {categories.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 pb-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Explorar por categoría</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {categories.map(cat => {
                const info = categoryData[cat.name] || { emoji: "📦", slug: cat.slug };
                return (
                  <Link key={cat.id} href={`/marketplace?category=${info.slug}`}>
                    <div className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer text-center">
                      <div className="text-3xl mb-1.5">{info.emoji}</div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-[#002D62] leading-tight">{cat.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(cat as any)._count?.products || 0}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LOAD MORE ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-8 flex justify-center">
        <Link href="/marketplace">
          <button
            className="px-20 py-3.5 rounded-full text-white text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#002D62" }}
          >
            Ver más productos
          </button>
        </Link>
      </div>

    </div>
  );
}
