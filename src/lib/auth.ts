import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { AuthUser } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "warrior-marketplace-secret-key-dominican-republic-2024"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    verificationStatus: user.verificationStatus,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("warrior_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireVerified(): Promise<AuthUser> {
  const session = await requireAuth();
  if (session.verificationStatus !== "FULLY_VERIFIED") {
    throw new Error("VERIFICATION_REQUIRED");
  }
  return session;
}

export function setSessionCookie(token: string) {
  // Used in API routes to set the cookie
  return token;
}

export const DOMINICAN_PROVINCES = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional",
  "Duarte", "El Seibo", "Elías Piña", "Espaillat", "Hato Mayor",
  "Hermanas Mirabal", "Independencia", "La Altagracia", "La Romana",
  "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi",
  "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná",
  "San Cristóbal", "San José de Ocoa", "San Juan", "San Pedro de Macorís",
  "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", "Santo Domingo",
  "Valverde"
];

export const PRODUCT_CONDITIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "LIKE_NEW", label: "Como Nuevo" },
  { value: "GOOD", label: "Buen Estado" },
  { value: "FAIR", label: "Estado Regular" },
  { value: "POOR", label: "Con Detalles" },
];
