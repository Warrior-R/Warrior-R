import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true, firstName: true, lastName: true, rating: true,
            totalRatings: true, avatarUrl: true, province: true, createdAt: true,
          },
        },
        category: true,
        auction: {
          include: {
            bids: {
              include: {
                bidder: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
        reviews: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { watchlist: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    // Increment views
    await prisma.product.update({ where: { id }, data: { views: { increment: 1 } } });

    return NextResponse.json({ success: true, data: { product } });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    if (product.sellerId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Sin permiso" }, { status: 403 });
    }

    await prisma.product.update({ where: { id }, data: { status: "EXPIRED" } });

    return NextResponse.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ success: false, error: "Error al eliminar producto" }, { status: 500 });
  }
}
