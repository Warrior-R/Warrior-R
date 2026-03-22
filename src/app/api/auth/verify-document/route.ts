import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyDocumentWithAI } from "@/lib/ai";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const formData = await req.formData();
    const frontFile = formData.get("cedulaFront") as File | null;
    const backFile = formData.get("cedulaBack") as File | null;

    if (!frontFile || !backFile) {
      return NextResponse.json(
        { success: false, error: "Se requieren ambos lados de la cédula" },
        { status: 400 }
      );
    }

    // Save files
    const uploadsDir = join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    const frontBuffer = Buffer.from(await frontFile.arrayBuffer());
    const backBuffer = Buffer.from(await backFile.arrayBuffer());

    const frontFilename = `${uuidv4()}-front.jpg`;
    const backFilename = `${uuidv4()}-back.jpg`;

    await writeFile(join(uploadsDir, frontFilename), frontBuffer);
    await writeFile(join(uploadsDir, backFilename), backBuffer);

    // AI verification
    const frontBase64 = frontBuffer.toString("base64");
    const backBase64 = backBuffer.toString("base64");

    const frontAnalysis = await verifyDocumentWithAI(frontBase64, "front");
    const backAnalysis = await verifyDocumentWithAI(backBase64, "back");

    if (!frontAnalysis.isValid || !backAnalysis.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "El documento no parece ser una cédula dominicana válida. Por favor intente con imágenes más claras.",
        },
        { status: 400 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: session.id },
      data: {
        cedulaFront: `/uploads/documents/${frontFilename}`,
        cedulaBack: `/uploads/documents/${backFilename}`,
        cedula: frontAnalysis.cedula || undefined,
        verificationStatus: "DOCUMENT_VERIFIED",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        cedula: frontAnalysis.cedula,
        name: frontAnalysis.name,
        message: "Documento verificado exitosamente",
      },
    });
  } catch (error) {
    console.error("Document verification error:", error);
    return NextResponse.json({ success: false, error: "Error al verificar documento" }, { status: 500 });
  }
}
