"use client";

import Link from "next/link";
import Image from "next/image";
import { Gavel, Star, MapPin, Heart, Clock, Zap, Eye } from "lucide-react";
import { formatCurrency, timeRemaining } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const isAuction = product.listingType === "AUCTION" || product.listingType === "BOTH";
  const auction = (product as any).auction;
  const seller = (product as any).seller;

  if (viewMode === "list") {
    return (
      <Link href={`/marketplace/${product.id}`}>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover flex gap-4 p-4">
          <div className="relative w-40 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              {isAuction ? (
                <span className="auction-badge text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Gavel className="w-3 h-3" /> Subasta
                </span>
              ) : (
                <span className="buy-now-badge text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Compra ya
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{product.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div>
                {isAuction && auction ? (
                  <div>
                    <p className="text-xs text-gray-500">Puja actual</p>
                    <p className="font-bold text-xl" style={{ color: "#CE1126" }}>{formatCurrency(Number(auction.currentPrice))}</p>
                    {auction.endTime && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining(auction.endTime)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-bold text-xl" style={{ color: "#002D62" }}>{formatCurrency(Number(product.price))}</p>
                )}
              </div>
              <div className="text-right">
                {seller && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    {seller.rating?.toFixed(1) || "Nuevo"}
                  </div>
                )}
                {product.province && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3" /> {product.province}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/marketplace/${product.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover group">
        {/* Image */}
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
            {isAuction ? (
              <span className="auction-badge text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <Gavel className="w-3 h-3" /> SUBASTA
              </span>
            ) : (
              <span className="buy-now-badge text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> COMPRA YA
              </span>
            )}
          </div>

          <button
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Heart className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {isAuction && auction?.endTime && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeRemaining(auction.endTime)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-1">{(product as any).category?.name}</p>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#002D62] transition-colors">
            {product.title}
          </h3>

          {isAuction && auction ? (
            <div>
              <p className="text-xs text-gray-500">Puja actual</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-base" style={{ color: "#CE1126" }}>{formatCurrency(Number(auction.currentPrice))}</p>
                <span className="text-xs text-gray-500">{auction._count?.bids || 0} pujas</span>
              </div>
              {auction.buyNowPrice && (
                <p className="text-xs mt-0.5" style={{ color: "#002D62" }}>
                  Cómpralo ya: {formatCurrency(Number(auction.buyNowPrice))}
                </p>
              )}
            </div>
          ) : (
            <p className="font-bold text-base" style={{ color: "#002D62" }}>{formatCurrency(Number(product.price))}</p>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {seller?.rating > 0 && (
                <>
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{seller.rating.toFixed(1)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {product.province && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{product.province}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
