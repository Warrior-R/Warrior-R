"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload, X, Brain, Gavel, Zap, Package, ChevronRight,
  Loader2, Sparkles, Image as ImageIcon, Clock, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { useAuthStore } from "@/store/authStore";
import { DOMINICAN_PROVINCES, PRODUCT_CONDITIONS } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AiSuggestion {
  category: string;
  subcategory: string;
  tags: string[];
  enhancedDescription: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState<"FIXED_PRICE" | "AUCTION" | "BOTH">("FIXED_PRICE");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    condition: "NEW",
    stock: "1",
    province: "",
    location: "",
    // Auction fields
    auctionStartPrice: "",
    auctionBuyNowPrice: "",
    auctionEndTime: "",
    auctionMinBidStep: "50",
  });

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (user.verificationStatus !== "FULLY_VERIFIED") {
      toast({ title: "Verifica tu identidad primero", variant: "error" });
      router.push("/auth/verify");
      return;
    }
    fetch("/api/categories").then((r) => r.json()).then((d) => {
      if (d.success) setCategories(d.data.categories);
    });
  }, [user, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...images, ...acceptedFiles].slice(0, 10);
    setImages(newFiles);
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10 - images.length,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const analyzeWithAI = async () => {
    if (!form.title || !form.description) {
      toast({ title: "Ingresa título y descripción primero", variant: "error" });
      return;
    }
    setAiLoading(true);
    try {
      let imageBase64: string | undefined;
      if (images[0]) {
        const buffer = await images[0].arrayBuffer();
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      }
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          title: form.title,
          description: form.description,
          imageBase64,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestion(data.data.analysis);
        // Auto-select category if match found
        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase().includes(data.data.analysis.category.toLowerCase()) ||
                 data.data.analysis.category.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCategory) {
          setForm((p) => ({ ...p, categoryId: matchedCategory.id }));
        }
        toast({ title: "¡Análisis IA completado!", variant: "success" });
      }
    } catch {
      toast({ title: "Error en análisis IA", variant: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiDescription = () => {
    if (aiSuggestion?.enhancedDescription) {
      setForm((p) => ({ ...p, description: aiSuggestion!.enhancedDescription }));
      toast({ title: "Descripción mejorada aplicada", variant: "success" });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      toast({ title: "Completa todos los campos requeridos", variant: "error" });
      return;
    }
    if (listingType !== "FIXED_PRICE" && !form.auctionEndTime) {
      toast({ title: "Selecciona la fecha de fin de subasta", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const productData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
        condition: form.condition,
        listingType,
        stock: parseInt(form.stock),
        province: form.province || undefined,
        location: form.location || undefined,
        ...(listingType !== "FIXED_PRICE" && {
          auctionStartPrice: form.auctionStartPrice ? parseFloat(form.auctionStartPrice) : parseFloat(form.price),
          auctionBuyNowPrice: form.auctionBuyNowPrice ? parseFloat(form.auctionBuyNowPrice) : undefined,
          auctionEndTime: form.auctionEndTime,
          auctionMinBidStep: parseFloat(form.auctionMinBidStep),
        }),
      };
      formData.append("data", JSON.stringify(productData));
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/products", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast({ title: "¡Producto publicado!", variant: "success" });
        router.push(`/marketplace/${data.data.product.id}`);
      } else {
        toast({ title: "Error", description: data.error, variant: "error" });
      }
    } catch {
      toast({ title: "Error al publicar", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar producto</h1>
        <p className="text-gray-500 mt-1">La IA detectará automáticamente la categoría y mejorará tu descripción</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-700" />
              Fotos del producto
              <span className="text-xs text-gray-400 font-normal">(máximo 10)</span>
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? "Suelta las imágenes aquí" : "Arrastra imágenes o haz clic para subir"}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP - Máx. 5MB cada una</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <div className="relative h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={preview} alt="" fill className="object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded font-medium">Principal</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-700" />
              Información del producto
            </h2>

            <div className="space-y-4">
              <Input
                label="Título del producto *"
                placeholder="Ej: iPhone 14 Pro Max 256GB Morado Espacial"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                maxLength={200}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={analyzeWithAI}
                    loading={aiLoading}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Mejorar con IA
                  </Button>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe tu producto en detalle: estado, características, accesorios incluidos..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                />
              </div>

              {/* AI Suggestions */}
              {aiSuggestion && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-900 text-sm">Sugerencias de IA</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Categoría detectada:</span>
                      <Badge variant="secondary" className="text-xs">{aiSuggestion.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Tags:</span>
                      {aiSuggestion.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={applyAiDescription} className="text-purple-600 hover:text-purple-700 hover:bg-purple-100">
                      <Sparkles className="w-3.5 h-3.5" /> Aplicar descripción mejorada
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => update("categoryId", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condición *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => update("condition", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRODUCT_CONDITIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <select
                    value={form.province}
                    onChange={(e) => update("province", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar provincia</option>
                    {DOMINICAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Ciudad/Sector"
                  placeholder="Santo Domingo Este"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Listing type */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-700" />
              Tipo de publicación y precio
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: "FIXED_PRICE" as const, icon: <Zap className="w-4 h-4" />, label: "Venta rápida", desc: "Precio fijo" },
                { value: "AUCTION" as const, icon: <Gavel className="w-4 h-4" />, label: "Subasta", desc: "Mejor precio" },
                { value: "BOTH" as const, icon: <Package className="w-4 h-4" />, label: "Ambos", desc: "Subasta + cómpralo ya" },
              ].map(({ value, icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setListingType(value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    listingType === value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`${listingType === value ? "text-blue-700" : "text-gray-500"} mb-1`}>{icon}</div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {(listingType === "FIXED_PRICE" || listingType === "BOTH") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label={listingType === "BOTH" ? "Precio 'Cómpralo ya'" : "Precio (DOP) *"}
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <Input
                    label="Stock disponible"
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    min="1"
                  />
                </div>
              )}

              {(listingType === "AUCTION" || listingType === "BOTH") && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-red-600" /> Configuración de subasta
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Precio inicial *"
                      type="number"
                      placeholder="0.00"
                      value={form.auctionStartPrice}
                      onChange={(e) => update("auctionStartPrice", e.target.value)}
                    />
                    <Input
                      label="Incremento mínimo"
                      type="number"
                      placeholder="50"
                      value={form.auctionMinBidStep}
                      onChange={(e) => update("auctionMinBidStep", e.target.value)}
                    />
                  </div>
                  {listingType === "AUCTION" && (
                    <Input
                      label="Precio 'Cómpralo ya' (opcional)"
                      type="number"
                      placeholder="0.00"
                      value={form.auctionBuyNowPrice}
                      onChange={(e) => update("auctionBuyNowPrice", e.target.value)}
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de fin *</label>
                    <input
                      type="datetime-local"
                      value={form.auctionEndTime}
                      onChange={(e) => update("auctionEndTime", e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Publicar</h3>
              <Button className="w-full" size="lg" loading={loading} onClick={handleSubmit}>
                <Package className="w-4 h-4" /> Publicar producto
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Al publicar aceptas nuestros{" "}
                <Link href="/terminos" className="text-blue-700 hover:underline">términos y condiciones</Link>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-sm">IA para vendedores</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5"><span>✨</span> Detecta la categoría automáticamente</li>
                <li className="flex items-start gap-1.5"><span>✨</span> Mejora tu descripción para más ventas</li>
                <li className="flex items-start gap-1.5"><span>✨</span> Genera tags de búsqueda relevantes</li>
                <li className="flex items-start gap-1.5"><span>✨</span> Analiza las imágenes del producto</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Consejos para vender más</h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5"><span>📸</span> Sube fotos de buena calidad y bien iluminadas</li>
                <li className="flex items-start gap-1.5"><span>📝</span> Describe el estado del producto honestamente</li>
                <li className="flex items-start gap-1.5"><span>💰</span> Investiga precios similares en el mercado</li>
                <li className="flex items-start gap-1.5"><span>📍</span> Indica tu provincia para compras locales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
