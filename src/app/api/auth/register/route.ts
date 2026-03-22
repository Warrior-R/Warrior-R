import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";
import { validateCedula } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  phone: z.string().optional(),
  cedula: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Validate cedula if provided
    if (data.cedula && !validateCedula(data.cedula)) {
      return NextResponse.json({ success: false, error: "Cédula inválida" }, { status: 400 });
    }

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
          ...(data.cedula ? [{ cedula: data.cedula }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.email === data.email) {
        return NextResponse.json({ success: false, error: "El email ya está registrado" }, { status: 400 });
      }
      if (existing.phone === data.phone) {
        return NextResponse.json({ success: false, error: "El teléfono ya está registrado" }, { status: 400 });
      }
      if (existing.cedula === data.cedula) {
        return NextResponse.json({ success: false, error: "La cédula ya está registrada" }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        cedula: data.cedula,
        province: data.province,
        city: data.city,
        role: data.role,
        verificationStatus: "PENDING",
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      verificationStatus: user.verificationStatus,
    });

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
      },
      message: "Registro exitoso. Por favor verifica tu identidad.",
    });

    response.cookies.set("warrior_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
