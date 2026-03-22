import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { analyzeProduct, analyzeSearchQuery, generateProductSuggestions } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, description, query, category, imageBase64 } = body;

    if (type === "product") {
      const analysis = await analyzeProduct(title, description, imageBase64);
      return NextResponse.json({ success: true, data: { analysis } });
    }

    if (type === "search") {
      const analysis = await analyzeSearchQuery(query);
      return NextResponse.json({ success: true, data: { analysis } });
    }

    if (type === "suggestions") {
      const suggestions = await generateProductSuggestions(category, query);
      return NextResponse.json({ success: true, data: { suggestions } });
    }

    return NextResponse.json({ success: false, error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("AI analyze error:", error);
    return NextResponse.json({ success: false, error: "Error en análisis IA" }, { status: 500 });
  }
}
