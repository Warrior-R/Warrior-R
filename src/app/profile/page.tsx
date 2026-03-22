"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Shield, Star, Edit2, Save, Package,
  ShoppingCart, CheckCircle, AlertCircle, Camera, Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toaster";
import { DOMINICAN_PROVINCES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data.user);
          setForm({
            firstName: data.data.user.firstName,
            lastName: data.data.user.lastName,
            phone: data.data.user.phone || "",
            province: data.data.user.province || "",
            city: data.data.user.city || "",
            address: data.data.user.address || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const verificationSteps = [
    {
      title: "Registro",
      done: true,
      desc: "Cuenta creada",
    },
    {
      title: "Cédula verificada",
      done: profile?.verificationStatus !== "PENDING",
      desc: "Documento de identidad",
      link: "/auth/verify",
    },
    {
      title: "Biometría verificada",
      done: profile?.verificationStatus === "FULLY_VERIFIED",
      desc: "Foto de rostro o huella",
      link: "/auth/verify",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>

            <div className="mt-3 flex items-center justify-center gap-2">
              {profile?.verificationStatus === "FULLY_VERIFIED" ? (
                <Badge variant="verified" className="gap-1">
                  <Shield className="w-3 h-3" /> Verificado
                </Badge>
              ) : (
                <Badge variant="warning" className="gap-1">
                  <AlertCircle className="w-3 h-3" /> Sin verificar
                </Badge>
              )}
              <Badge variant="secondary">
                {profile?.role === "SELLER" ? "Vendedor" : profile?.role === "ADMIN" ? "Admin" : "Comprador"}
              </Badge>
            </div>

            {profile?.rating > 0 && (
              <div className="flex items-center justify-center gap-1 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(profile.rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
                ))}
                <span className="text-sm text-gray-600 ml-1">{profile.rating.toFixed(1)} ({profile.totalRatings})</span>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Link href="/buyer/orders" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" /> Compras
                </Button>
              </Link>
              {profile?.role === "SELLER" && (
                <Link href="/seller/dashboard" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <Package className="w-3.5 h-3.5" /> Ventas
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Verification status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" /> Estado de verificación
            </h3>
            <div className="space-y-3">
              {verificationSteps.map((step, i) => (
                <div key={step.title} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? "bg-green-100" : "bg-gray-100"
                  }`}>
                    {step.done ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-sm text-gray-500">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-500"}`}>{step.title}</p>
                    <p className="text-xs text-gray-400">{step.desc}</p>
                  </div>
                  {!step.done && step.link && (
                    <Link href={step.link}>
                      <Button variant="ghost" size="sm" className="text-blue-700 text-xs">Verificar</Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {profile?.verificationStatus !== "FULLY_VERIFIED" && (
              <Link href="/auth/verify">
                <Button className="w-full mt-4" size="sm">
                  <Shield className="w-4 h-4" /> Completar verificación
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Info form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Información personal</h3>
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => setEditing(!editing)}
                className="gap-2"
              >
                {editing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editing ? "Guardar" : "Editar"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  disabled={!editing}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Apellido"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <Input
                label="Correo electrónico"
                value={profile?.email}
                disabled
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                icon={<Phone className="w-4 h-4" />}
              />

              {profile?.cedula && (
                <Input
                  label="Número de Cédula"
                  value={profile.cedula}
                  disabled
                  icon={<Shield className="w-4 h-4" />}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    disabled={!editing}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Seleccionar...</option>
                    {DOMINICAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Ciudad"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  disabled={!editing}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Dirección"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={!editing}
                placeholder="Av. 27 de Febrero, #123, Santo Domingo"
              />

              <div className="text-xs text-gray-400 pt-2">
                Miembro desde: {profile?.createdAt && formatDate(profile.createdAt)}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Link href="/seller/new">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:bg-blue-100 transition-colors cursor-pointer">
                <Package className="w-6 h-6 text-blue-700 mb-2" />
                <h4 className="font-semibold text-gray-900">Vender producto</h4>
                <p className="text-xs text-gray-500 mt-1">Publica un nuevo anuncio</p>
              </div>
            </Link>
            <Link href="/marketplace?listingType=AUCTION">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 hover:bg-red-100 transition-colors cursor-pointer">
                <Gavel className="w-6 h-6 text-red-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Ver subastas</h4>
                <p className="text-xs text-gray-500 mt-1">Subastas activas ahora</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
