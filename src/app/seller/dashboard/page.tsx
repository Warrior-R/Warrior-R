"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, DollarSign, ShoppingCart, Star, Plus, Eye, Edit2, Trash2, TrendingUp, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface Stats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalSales: 0, totalRevenue: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products/seller"),
        fetch("/api/orders?role=seller"),
      ]);
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (productsData.success) {
        setProducts(productsData.data.products);
        const activeProducts = productsData.data.products.filter((p: any) => p.status === "ACTIVE");
        setStats((prev) => ({ ...prev, totalProducts: activeProducts.length }));
      }
      if (ordersData.success) {
        const ordersList = ordersData.data.orders;
        setOrders(ordersList);
        const revenue = ordersList.filter((o: any) => o.status !== "CANCELLED").reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0);
        setStats((prev) => ({
          ...prev,
          totalSales: ordersList.length,
          totalRevenue: revenue,
          avgRating: 0,
        }));
      }
    } catch {
      toast({ title: "Error al cargar datos", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Producto eliminado", variant: "success" });
    } else {
      toast({ title: "Error", description: data.error, variant: "error" });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, any> = {
      ACTIVE: { variant: "success", label: "Activo" },
      SOLD: { variant: "default", label: "Vendido" },
      DRAFT: { variant: "warning", label: "Borrador" },
      EXPIRED: { variant: "secondary", label: "Expirado" },
    };
    const cfg = map[status] || { variant: "secondary", label: status };
    return <Badge variant={cfg.variant as any}>{cfg.label}</Badge>;
  };

  const orderStatusBadge = (status: string) => {
    const map: Record<string, any> = {
      PENDING: { variant: "warning", label: "Pendiente" },
      PAID: { variant: "success", label: "Pagado" },
      SHIPPED: { variant: "default", label: "Enviado" },
      DELIVERED: { variant: "verified", label: "Entregado" },
      CANCELLED: { variant: "destructive", label: "Cancelado" },
    };
    const cfg = map[status] || { variant: "secondary", label: status };
    return <Badge variant={cfg.variant as any}>{cfg.label}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Vendedor</h1>
          <p className="text-gray-500 mt-1">Bienvenido, {user?.firstName}. Gestiona tus ventas.</p>
        </div>
        <Link href="/seller/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Package, label: "Productos activos", value: stats.totalProducts.toString(), color: "blue" },
          { icon: ShoppingCart, label: "Total ventas", value: stats.totalSales.toString(), color: "green" },
          { icon: DollarSign, label: "Ingresos totales", value: formatCurrency(stats.totalRevenue), color: "purple" },
          { icon: Star, label: "Calificación", value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : "Sin calificar", color: "amber" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              color === "blue" ? "bg-blue-100" :
              color === "green" ? "bg-green-100" :
              color === "purple" ? "bg-purple-100" : "bg-amber-100"
            }`}>
              <Icon className={`w-5 h-5 ${
                color === "blue" ? "text-blue-700" :
                color === "green" ? "text-green-700" :
                color === "purple" ? "text-purple-700" : "text-amber-600"
              }`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {[
          { key: "products", label: "Mis productos", count: products.length },
          { key: "orders", label: "Mis ventas", count: orders.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
              activeTab === key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : activeTab === "products" ? (
        products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes productos publicados</h3>
            <p className="text-gray-500 mb-6">¡Empieza a vender hoy!</p>
            <Link href="/seller/new">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Publicar primer producto</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {product.images[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {statusBadge(product.status)}
                        {product.listingType === "AUCTION" && (
                          <Badge variant="auction" className="gap-1"><Gavel className="w-3 h-3" /> Subasta</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.category?.name} · {formatDate(product.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-blue-800">{formatCurrency(Number(product.price))}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Eye className="w-3 h-3" /> {product.views} visitas
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/marketplace/${product.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes ventas aún</h3>
            <p className="text-gray-500">Cuando alguien compre tus productos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {orderStatusBadge(order.status)}
                    <span className="text-sm text-gray-500">Orden #{order.id.slice(-8)}</span>
                  </div>
                  <span className="font-bold text-blue-800">{formatCurrency(Number(order.totalAmount))}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                    {order.buyer?.firstName?.[0]}{order.buyer?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 flex-1">{item.product?.title}</p>
                    <span className="text-sm font-medium">{formatCurrency(Number(item.price))}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
