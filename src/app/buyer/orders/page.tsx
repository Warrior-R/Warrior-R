"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, Truck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

export default function BuyerOrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetch("/api/orders?role=buyer")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.data.orders);
      })
      .catch(() => toast({ title: "Error al cargar órdenes", variant: "error" }))
      .finally(() => setLoading(false));
  }, [user]);

  const statusConfig: Record<string, { variant: any; label: string; icon: React.ReactNode }> = {
    PENDING: { variant: "warning", label: "Pendiente", icon: <Clock className="w-4 h-4" /> },
    PAID: { variant: "success", label: "Pagado", icon: <CheckCircle className="w-4 h-4" /> },
    SHIPPED: { variant: "default", label: "Enviado", icon: <Truck className="w-4 h-4" /> },
    DELIVERED: { variant: "verified", label: "Entregado", icon: <CheckCircle className="w-4 h-4" /> },
    CANCELLED: { variant: "destructive", label: "Cancelado", icon: <XCircle className="w-4 h-4" /> },
  };

  const paymentLabels: Record<string, string> = {
    CASH_ON_DELIVERY: "💵 Pago contra entrega",
    BANK_TRANSFER: "🏦 Transferencia bancaria",
    CARD: "💳 Tarjeta",
    PAGOMOVIL: "📱 PagoMóvil",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>
        <p className="text-gray-500 mt-1">Historial de tus órdenes de compra</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes compras aún</h3>
          <p className="text-gray-500 mb-6">¡Explora el marketplace y encuentra lo que necesitas!</p>
          <Link href="/marketplace">
            <Button className="gap-2"><Package className="w-4 h-4" /> Explorar marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || { variant: "secondary", label: order.status, icon: null };
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Order header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-sm text-gray-500">Orden #{order.id.slice(-8)}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-800">{formatCurrency(Number(order.totalAmount))}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 mb-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.product?.title}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(Number(item.price))}</p>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vendedor</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                          {order.seller?.firstName?.[0]}
                        </div>
                        <span className="text-sm font-medium">{order.seller?.firstName} {order.seller?.lastName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">{paymentLabels[order.paymentMethod]}</p>
                      {order.status === "DELIVERED" && (
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Star className="w-3 h-3" /> Calificar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
