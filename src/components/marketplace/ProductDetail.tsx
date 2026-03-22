"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gavel, Zap, Shield, Star, MapPin, Clock, Heart, Share2,
  ChevronLeft, ChevronRight, AlertCircle, Package, Truck,
  CheckCircle, User, MessageCircle, TrendingUp, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, timeRemaining } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";

interface ProductDetailProps {
  product: any;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [auction, setAuction] = useState(product.auction);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const { user } = useAuthStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isAuction = product.listingType === "AUCTION" || product.listingType === "BOTH";
  const minBid = auction ? Number(auction.currentPrice) + Number(auction.minBidStep) : 0;

  // Countdown timer
  useEffect(() => {
    if (!auction) return;
    const updateTimer = () => {
      setTimeLeft(timeRemaining(auction.endTime));
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [auction]);

  const handleBid = async () => {
    if (!user) {
      toast({ title: "Inicia sesión para pujar", variant: "error" });
      return;
    }
    if (user.verificationStatus !== "FULLY_VERIFIED") {
      toast({ title: "Verifica tu identidad para pujar", variant: "error" });
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast({ title: `La puja mínima es ${formatCurrency(minBid)}`, variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId: auction.id, amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "¡Puja realizada!", description: `Tu puja de ${formatCurrency(amount)} fue registrada.`, variant: "success" });
        setAuction((prev: any) => ({
          ...prev,
          currentPrice: amount,
          bids: [{ ...data.data.bid, bidder: user }, ...(prev.bids || [])],
        }));
        setBidAmount("");
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error de conexión", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({ title: "Inicia sesión para comprar", variant: "error" });
      return;
    }
    if (user.verificationStatus !== "FULLY_VERIFIED") {
      toast({ title: "Verifica tu identidad para comprar", variant: "error" });
      return;
    }
    setShowBuyModal(true);
  };

  const confirmPurchase = async () => {
    setBuyLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "¡Compra realizada!", description: "Tu orden fue confirmada.", variant: "success" });
        setShowBuyModal(false);
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error de conexión", variant: "error" });
    } finally {
      setBuyLoading(false);
    }
  };

  const images = product.images.length > 0 ? product.images : [null];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/marketplace" className="hover:text-blue-700 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Marketplace
        </Link>
        <span>/</span>
        <span>{product.category?.name}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {images[currentImage] ? (
              <Image src={images[currentImage]} alt={product.title} fill className="object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              {isAuction ? (
                <span className="auction-badge text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                  <Gavel className="w-3.5 h-3.5" /> SUBASTA EN VIVO
                </span>
              ) : (
                <span className="buy-now-badge text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> COMPRA RÁPIDA
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    currentImage === i ? "border-blue-600" : "border-gray-200"
                  }`}
                >
                  {img ? <Image src={img} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">📦</div>}
                </button>
              ))}
            </div>
          )}

          {/* Product info */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{product.category?.name}</Badge>
                  <Badge variant="outline">
                    {product.condition === "NEW" ? "Nuevo" :
                     product.condition === "LIKE_NEW" ? "Como Nuevo" :
                     product.condition === "GOOD" ? "Buen Estado" :
                     product.condition === "FAIR" ? "Estado Regular" : "Con Detalles"}
                  </Badge>
                  {product.aiTags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                {product.province && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" /> {product.province}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="prose prose-sm text-gray-600 mb-6">
              <p className="whitespace-pre-wrap">{product.aiDescription || product.description}</p>
            </div>

            {/* AI Enhanced note */}
            {product.aiDescription && (
              <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                <span>✨</span>
                <span>Descripción mejorada con Inteligencia Artificial para darte más detalles del producto</span>
              </div>
            )}

            {/* Bid history */}
            {isAuction && auction?.bids && auction.bids.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" /> Historial de pujas
                </h3>
                <div className="space-y-2">
                  {auction.bids.map((bid: any, i: number) => (
                    <div key={bid.id} className={`flex items-center justify-between text-sm p-2 rounded-lg ${i === 0 ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                          {bid.bidder?.firstName?.[0]}{bid.bidder?.lastName?.[0]}
                        </div>
                        <span className="font-medium">{bid.bidder?.firstName} {bid.bidder?.lastName?.[0]}.</span>
                        {i === 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Ganando</span>}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${i === 0 ? "text-red-600" : "text-gray-600"}`}>{formatCurrency(Number(bid.amount))}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(bid.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Purchase panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Price section */}
              <div className={`p-5 ${isAuction ? "bg-red-50 border-b border-red-200" : "bg-blue-50 border-b border-blue-200"}`}>
                {isAuction && auction ? (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Puja actual</p>
                    <p className="text-4xl font-bold text-red-600 mb-1">{formatCurrency(Number(auction.currentPrice))}</p>
                    <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Termina en: {timeLeft}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                      <span>{auction.bids?.length || 0} pujas</span>
                      <span>Precio inicial: {formatCurrency(Number(auction.startPrice))}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-1">Precio</p>
                    <p className="text-4xl font-bold text-blue-800">{formatCurrency(Number(product.price))}</p>
                    {product.stock > 1 && (
                      <p className="text-xs text-gray-500 mt-1">{product.stock} disponibles</p>
                    )}
                  </>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Bid input */}
                {isAuction && auction && auction.status === "ACTIVE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tu puja (mínimo {formatCurrency(minBid)})
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">RD$</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={minBid.toFixed(2)}
                          className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-red-500 font-semibold"
                          min={minBid}
                          step={50}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full mt-2 bg-red-600 hover:bg-red-700"
                      loading={loading}
                      onClick={handleBid}
                    >
                      <Gavel className="w-4 h-4" /> Realizar puja
                    </Button>

                    {auction.buyNowPrice && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Cómpralo ya</span>
                          <span className="font-bold text-green-600">{formatCurrency(Number(auction.buyNowPrice))}</span>
                        </div>
                        <Button variant="success" className="w-full" onClick={handleBuyNow}>
                          <Zap className="w-4 h-4" /> Comprar ahora
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Buy now button */}
                {product.listingType === "FIXED_PRICE" && (
                  <Button size="lg" className="w-full" onClick={handleBuyNow}>
                    <Zap className="w-4 h-4" /> Comprar ahora
                  </Button>
                )}

                {/* Security badges */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {[
                    { icon: Shield, text: "Vendedor verificado con cédula y biometría" },
                    { icon: Package, text: "Envíos a toda la República Dominicana" },
                    { icon: CheckCircle, text: "Protección al comprador garantizada" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                      <Icon className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Payment methods */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Métodos de pago aceptados:</p>
                  <div className="flex gap-2 flex-wrap">
                    {["💳 Tarjeta", "🏦 Banco", "💵 Efectivo", "📱 PagoMóvil"].map((m) => (
                      <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Vendedor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {product.seller?.firstName?.[0]}{product.seller?.lastName?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-900">{product.seller?.firstName} {product.seller?.lastName}</p>
                    {product.seller?.verificationStatus === "FULLY_VERIFIED" && (
                      <Shield className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  {product.seller?.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(product.seller.rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
                      ))}
                      <span>{product.seller.rating.toFixed(1)} ({product.seller.totalRatings})</span>
                    </div>
                  )}
                  {product.seller?.province && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {product.seller.province}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                <MessageCircle className="w-4 h-4" /> Contactar vendedor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Buy modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar compra</h2>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900">{product.title}</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{formatCurrency(Number(product.price))}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
              <div className="space-y-2">
                {[
                  { value: "CASH_ON_DELIVERY", label: "💵 Pago contra entrega" },
                  { value: "BANK_TRANSFER", label: "🏦 Transferencia bancaria" },
                  { value: "CARD", label: "💳 Tarjeta de crédito/débito" },
                  { value: "PAGOMOVIL", label: "📱 PagoMóvil" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowBuyModal(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" loading={buyLoading} onClick={confirmPurchase}>
                Confirmar compra
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
