"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Filter, Grid3X3, List, SlidersHorizontal, X,
  Gavel, Zap, Brain, ChevronDown, Star, MapPin, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import { DOMINICAN_PROVINCES, PRODUCT_CONDITIONS } from "@/lib/auth";
import type { Product } from "@/types";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "views-desc", label: "Más populares" },
];

const LIST_TYPES = [
  { value: "", label: "Todos", icon: null },
  { value: "FIXED_PRICE", label: "Compra rápida", icon: <Zap className="w-3.5 h-3.5" /> },
  { value: "AUCTION", label: "Subastas", icon: <Gavel className="w-3.5 h-3.5" /> },
];

export function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    listingType: searchParams.get("listingType") || "",
    condition: "",
    province: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data.categories);
  }, []);

  const fetchProducts = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: "20",
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.listingType && { listingType: filters.listingType }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.province && { province: filters.province }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();

    if (data.success) {
      setProducts(data.data.products);
      setTotalProducts(data.data.pagination.total);
    }
    setLoading(false);
  }, [filters, page]);

  // AI search suggestions
  const fetchAiSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3) { setAiSuggestions([]); return; }
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "suggestions", category: filters.category, query }),
      });
      const data = await res.json();
      if (data.success) setAiSuggestions(data.data.suggestions);
    } catch {
      setAiSuggestions([]);
    }
  }, [filters.category]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(true); }, [filters]);

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      listingType: "",
      condition: "",
      province: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const activeFilterCount = [
    filters.category, filters.listingType, filters.condition,
    filters.province, filters.minPrice, filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => {
              updateFilter("search", e.target.value);
              fetchAiSuggestions(e.target.value);
            }}
            placeholder="¿Qué estás buscando? La IA entiende tu búsqueda..."
            className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-500 bg-white shadow-sm"
          />
          {filters.search && (
            <button onClick={() => updateFilter("search", "")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Brain className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="text-xs text-purple-600 font-medium">IA sugiere:</span>
            {aiSuggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => { updateFilter("search", s); setAiSuggestions([]); }}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Listing type tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-4">
        {LIST_TYPES.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => updateFilter("listingType", value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filters.listingType === value
                ? value === "AUCTION"
                  ? "bg-red-600 text-white"
                  : "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-60 shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpiar ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Categoría</h4>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Precio (DOP)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín."
                  value={filters.minPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Máx."
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Condición</h4>
              <div className="space-y-1.5">
                {[{ value: "", label: "Todas" }, ...PRODUCT_CONDITIONS].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={value}
                      checked={filters.condition === value}
                      onChange={(e) => updateFilter("condition", e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Province */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Provincia</h4>
              <select
                value={filters.province}
                onChange={(e) => updateFilter("province", e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toda la RD</option>
                {DOMINICAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="bg-blue-700 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">{activeFilterCount}</span>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                {loading ? "Cargando..." : `${totalProducts.toLocaleString()} productos encontrados`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setFilters((p) => ({ ...p, sortBy, sortOrder }));
                }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <div className="hidden md:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-700 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-700 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(filters.category || filters.condition || filters.province) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                  <button onClick={() => updateFilter("category", "")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {PRODUCT_CONDITIONS.find((c) => c.value === filters.condition)?.label}
                  <button onClick={() => updateFilter("condition", "")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {filters.province && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {filters.province}
                  <button onClick={() => updateFilter("province", "")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse">
                  <div className="h-48 rounded-t-xl bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No encontramos resultados</h3>
              <p className="text-gray-500 mb-6">Intenta con otros términos o ajusta los filtros</p>
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Load more */}
          {!loading && products.length < totalProducts && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => { setPage((p) => p + 1); fetchProducts(); }}
              >
                Cargar más productos
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
