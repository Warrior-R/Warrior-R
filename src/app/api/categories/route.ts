import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: { categories } });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener categorías" }, { status: 500 });
  }
}
