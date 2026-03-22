import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { analyzeProduct } from "@/lib/ai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const listingType = searchParams.get("listingType") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition") || "";
    const province = searchParams.get("province") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const where: Record<string, unknown> = {
      status: "ACTIVE",
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { aiTags: { hasSome: [search] } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(listingType && { listingType }),
      ...(condition && { condition }),
      ...(province && { province }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: { id: true, firstName: true, lastName: true, rating: true, avatarUrl: true, province: true },
          },
          category: { select: { id: true, name: true, slug: true } },
          auction: {
            select: {
              id: true, currentPrice: true, endTime: true, status: true, buyNowPrice: true,
              _count: { select: { bids: true } },
            },
          },
          _count: { select: { watchlist: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener productos" }, { status: 500 });
  }
}

const createProductSchema = z.object({
  title: z.string().min(5, "Título muy corto").max(200),
  description: z.string().min(20, "Descripción muy corta"),
  price: z.number().positive("Precio debe ser positivo"),
  categoryId: z.string(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  listingType: z.enum(["FIXED_PRICE", "AUCTION", "BOTH"]).default("FIXED_PRICE"),
  stock: z.number().int().positive().default(1),
  province: z.string().optional(),
  location: z.string().optional(),
  // Auction fields
  auctionStartPrice: z.number().optional(),
  auctionBuyNowPrice: z.number().optional(),
  auctionEndTime: z.string().optional(),
  auctionMinBidStep: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    if (session.verificationStatus !== "FULLY_VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Debes verificar tu identidad antes de vender" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const productData = JSON.parse(formData.get("data") as string);
    const validated = createProductSchema.parse(productData);

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    const imagePaths: string[] = [];

    if (imageFiles.length > 0) {
      const uploadsDir = join(process.cwd(), "public", "uploads", "products");
      await mkdir(uploadsDir, { recursive: true });

      for (const file of imageFiles.slice(0, 10)) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}.jpg`;
        await writeFile(join(uploadsDir, filename), buffer);
        imagePaths.push(`/uploads/products/${filename}`);
      }
    }

    // AI Analysis
    let aiAnalysis = null;
    try {
      const firstImagePath = imagePaths[0];
      let imageBase64: string | undefined;
      if (firstImagePath) {
        const { readFile } = await import("fs/promises");
        const imgBuffer = await readFile(join(process.cwd(), "public", firstImagePath));
        imageBase64 = imgBuffer.toString("base64");
      }
      aiAnalysis = await analyzeProduct(validated.title, validated.description, imageBase64);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
    }

    // Update seller role
    await prisma.user.update({
      where: { id: session.id },
      data: { role: "SELLER" },
    });

    const product = await prisma.product.create({
      data: {
        title: validated.title,
        description: validated.description,
        price: validated.price,
        categoryId: validated.categoryId,
        condition: validated.condition,
        listingType: validated.listingType,
        stock: validated.stock,
        province: validated.province,
        location: validated.location,
        sellerId: session.id,
        images: imagePaths,
        aiCategory: aiAnalysis?.category,
        aiTags: aiAnalysis?.tags || [],
        aiDescription: aiAnalysis?.enhancedDescription,
        status: "ACTIVE",
        ...(validated.listingType !== "FIXED_PRICE" &&
          validated.auctionEndTime && {
            auction: {
              create: {
                startPrice: validated.auctionStartPrice || validated.price,
                currentPrice: validated.auctionStartPrice || validated.price,
                buyNowPrice: validated.auctionBuyNowPrice,
                minBidStep: validated.auctionMinBidStep || 50,
                startTime: new Date(),
                endTime: new Date(validated.auctionEndTime),
                status: "ACTIVE",
              },
            },
          }),
      },
      include: {
        category: true,
        auction: true,
        seller: {
          select: { id: true, firstName: true, lastName: true, rating: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: { product } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error("Product create error:", error);
    return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 });
  }
}
