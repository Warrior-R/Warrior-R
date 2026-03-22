import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("warrior_session")?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("warrior_session");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
