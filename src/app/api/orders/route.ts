import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH_ON_DELIVERY", "PAGOMOVIL"]),
  shippingAddr: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    if (session.verificationStatus !== "FULLY_VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Debes verificar tu identidad para comprar" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = orderSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { seller: true },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Producto no disponible" }, { status: 400 });
    }

    if (product.sellerId === session.id) {
      return NextResponse.json(
        { success: false, error: "No puedes comprar tu propio producto" },
        { status: 400 }
      );
    }

    if (product.stock < data.quantity) {
      return NextResponse.json({ success: false, error: "Stock insuficiente" }, { status: 400 });
    }

    const totalAmount = Number(product.price) * data.quantity;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: session.id,
          sellerId: product.sellerId,
          totalAmount,
          paymentMethod: data.paymentMethod,
          shippingAddr: data.shippingAddr,
          notes: data.notes,
          items: {
            create: {
              productId: data.productId,
              quantity: data.quantity,
              price: product.price,
            },
          },
        },
        include: { items: { include: { product: true } }, buyer: true, seller: true },
      });

      // Update stock
      await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: { decrement: data.quantity },
          ...(product.stock - data.quantity === 0 && { status: "SOLD" }),
        },
      });

      // Notify seller
      await tx.notification.create({
        data: {
          userId: product.sellerId,
          title: "Nueva orden recibida",
          message: `${session.firstName} compró "${product.title}"`,
          type: "NEW_ORDER",
          link: `/seller/orders/${newOrder.id}`,
        },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: { order } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error("Order error:", error);
    return NextResponse.json({ success: false, error: "Error al crear orden" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "buyer";

    const orders = await prisma.order.findMany({
      where: role === "seller" ? { sellerId: session.id } : { buyerId: session.id },
      include: {
        items: { include: { product: { select: { id: true, title: true, images: true } } } },
        buyer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        seller: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener órdenes" }, { status: 500 });
  }
}
