import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        cedula: true,
        verificationStatus: true,
        role: true,
        isActive: true,
        address: true,
        city: true,
        province: true,
        country: true,
        avatarUrl: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
