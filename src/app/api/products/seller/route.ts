import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: session.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        auction: { select: { id: true, currentPrice: true, status: true, endTime: true, _count: { select: { bids: true } } } },
        _count: { select: { watchlist: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { products } });
  } catch (error) {
    console.error("Seller products error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener productos" }, { status: 500 });
  }
}
