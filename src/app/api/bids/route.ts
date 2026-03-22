import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const bidSchema = z.object({
  auctionId: z.string(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    if (session.verificationStatus !== "FULLY_VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Debes verificar tu identidad para pujar" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { auctionId, amount } = bidSchema.parse(body);

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: { select: { sellerId: true, title: true } } },
    });

    if (!auction) {
      return NextResponse.json({ success: false, error: "Subasta no encontrada" }, { status: 404 });
    }

    if (auction.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "La subasta no está activa" }, { status: 400 });
    }

    if (new Date() > auction.endTime) {
      await prisma.auction.update({ where: { id: auctionId }, data: { status: "ENDED" } });
      return NextResponse.json({ success: false, error: "La subasta ha finalizado" }, { status: 400 });
    }

    if (auction.product.sellerId === session.id) {
      return NextResponse.json(
        { success: false, error: "No puedes pujar en tu propia subasta" },
        { status: 400 }
      );
    }

    const minBid = Number(auction.currentPrice) + Number(auction.minBidStep);
    if (amount < minBid) {
      return NextResponse.json(
        {
          success: false,
          error: `La oferta mínima es RD$${minBid.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Create bid and update auction in transaction
    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          auctionId,
          bidderId: session.id,
          amount,
          isWinning: true,
        },
        include: {
          bidder: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      prisma.bid.updateMany({
        where: { auctionId, bidderId: { not: session.id } },
        data: { isWinning: false },
      }),
      prisma.auction.update({
        where: { id: auctionId },
        data: { currentPrice: amount, winnerId: session.id },
      }),
    ]);

    // Create notification for previous winner (outbid)
    const previousWinner = await prisma.bid.findFirst({
      where: { auctionId, isWinning: false, bidderId: { not: session.id } },
      orderBy: { amount: "desc" },
    });

    if (previousWinner) {
      await prisma.notification.create({
        data: {
          userId: previousWinner.bidderId,
          title: "Tu oferta fue superada",
          message: `Alguien pujó más alto en "${auction.product.title}". ¡Puja de nuevo!`,
          type: "OUTBID",
          link: `/marketplace/${auction.productId}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: { bid } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error("Bid error:", error);
    return NextResponse.json({ success: false, error: "Error al realizar puja" }, { status: 500 });
  }
}
