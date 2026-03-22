import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetail } from "@/components/marketplace/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, status: { in: ["ACTIVE"] } },
    include: {
      seller: {
        select: {
          id: true, firstName: true, lastName: true, rating: true,
          totalRatings: true, avatarUrl: true, province: true, createdAt: true,
          verificationStatus: true,
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

  if (!product) notFound();

  // Update views
  await prisma.product.update({ where: { id }, data: { views: { increment: 1 } } });

  return <ProductDetail product={product as any} />;
}
