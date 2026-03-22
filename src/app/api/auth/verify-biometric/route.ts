import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function verifyFaceWithAI(photoBase64: string): Promise<{ isHuman: boolean; quality: string }> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: photoBase64 },
            },
            {
              type: "text",
              text: `Analiza esta foto y determina:
1. ¿Es una foto real de un rostro humano? (no caricatura, no dibujo, no foto de foto)
2. ¿La calidad es suficiente para verificación de identidad?

Responde SOLO en JSON:
{"isHuman": boolean, "quality": "GOOD|FAIR|POOR", "message": "string"}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isHuman: false, quality: "POOR" };
    const result = JSON.parse(jsonMatch[0]);
    return { isHuman: result.isHuman, quality: result.quality };
  } catch {
    return { isHuman: false, quality: "POOR" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || user.verificationStatus === "PENDING") {
      return NextResponse.json(
        { success: false, error: "Primero debes verificar tu documento de identidad" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const biometricType = formData.get("type") as "face" | "fingerprint";
    const photoFile = formData.get("photo") as File | null;

    if (!photoFile) {
      return NextResponse.json({ success: false, error: "Foto requerida" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "public", "uploads", "biometric");
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const filename = `${uuidv4()}-${biometricType}.jpg`;
    await writeFile(join(uploadsDir, filename), buffer);

    if (biometricType === "face") {
      const base64 = buffer.toString("base64");
      const faceVerification = await verifyFaceWithAI(base64);

      if (!faceVerification.isHuman || faceVerification.quality === "POOR") {
        return NextResponse.json(
          {
            success: false,
            error: "No se pudo verificar el rostro. Asegúrate de que tu cara esté bien iluminada y visible.",
          },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: session.id },
        data: {
          facePhoto: `/uploads/biometric/${filename}`,
          verificationStatus: "FULLY_VERIFIED",
        },
      });
    } else {
      // Fingerprint: store hash
      const crypto = await import("crypto");
      const fingerprintHash = crypto.createHash("sha256").update(buffer).digest("hex");

      await prisma.user.update({
        where: { id: session.id },
        data: {
          fingerprintHash,
          verificationStatus: "FULLY_VERIFIED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "¡Verificación biométrica exitosa! Tu cuenta está completamente verificada.",
    });
  } catch (error) {
    console.error("Biometric verification error:", error);
    return NextResponse.json({ success: false, error: "Error en verificación biométrica" }, { status: 500 });
  }
}
