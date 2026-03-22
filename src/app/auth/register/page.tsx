"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, User, Mail, Lock, Phone, MapPin, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toaster";
import { DOMINICAN_PROVINCES } from "@/lib/constants";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    province: "",
    city: "",
    role: "BUYER" as "BUYER" | "SELLER",
    cedula: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Nombre requerido";
    if (!form.lastName.trim()) newErrors.lastName = "Apellido requerido";
    if (!form.email.trim()) newErrors.email = "Email requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email inválido";
    if (!form.password) newErrors.password = "Contraseña requerida";
    if (form.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          province: form.province || undefined,
          city: form.city || undefined,
          role: form.role,
          cedula: form.cedula || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        toast({ title: "¡Bienvenido!", description: "Cuenta creada. Ahora verifica tu identidad.", variant: "success" });
        router.push("/auth/verify");
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-800">WarriorMarket</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-600 mt-1">Únete al marketplace dominicano más seguro</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${step >= s ? "bg-blue-600" : "bg-gray-200"}`} />
              <p className={`text-xs mt-1 ${step >= s ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                {s === 1 ? "Datos personales" : "Tipo de cuenta"}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre"
                  placeholder="Juan"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  error={errors.firstName}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Apellido"
                  placeholder="Pérez"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  error={errors.lastName}
                />
              </div>

              <Input
                label="Correo electrónico"
                type="email"
                placeholder="juan@ejemplo.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                error={errors.email}
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Teléfono (opcional)"
                type="tel"
                placeholder="809-000-0000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Número de Cédula (opcional)"
                placeholder="001-0000000-1"
                value={form.cedula}
                onChange={(e) => update("cedula", e.target.value)}
                error={errors.cedula}
                icon={<Shield className="w-4 h-4" />}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <select
                    value={form.province}
                    onChange={(e) => update("province", e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {DOMINICAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Ciudad"
                  placeholder="Santo Domingo"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  error={errors.password}
                  icon={<Lock className="w-4 h-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repetir contraseña"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                icon={<Lock className="w-4 h-4" />}
              />

              <Button
                className="w-full"
                onClick={() => { if (validateStep1()) setStep(2); }}
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-2">¿Cómo usarás WarriorMarket?</h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "BUYER", icon: "🛒", title: "Comprador", desc: "Solo quiero comprar productos" },
                  { value: "SELLER", icon: "🏪", title: "Vendedor", desc: "Quiero vender mis productos" },
                ].map(({ value, icon, title, desc }) => (
                  <button
                    key={value}
                    onClick={() => update("role", value)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      form.role === value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Verificación de Identidad Requerida</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Para garantizar la seguridad de todos, deberás verificar tu cédula dominicana y tu identidad biométrica (foto o huella) tras el registro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button className="flex-1" loading={loading} onClick={handleSubmit}>
                  Crear cuenta
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-blue-700 font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
