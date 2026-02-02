import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET || "mobile-secret-key"
);

// Token expiry: 7 days for mobile (longer than web sessions)
const TOKEN_EXPIRY = "7d";

export interface MobileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
}

export interface MobileTokenPayload {
  sub: string; // user id
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for mobile authentication
 */
export async function generateMobileToken(user: MobileUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a mobile JWT token
 */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as MobileTokenPayload;
  } catch (error) {
    console.error("Mobile token verification failed:", error);
    return null;
  }
}

/**
 * Authenticate a user for mobile login
 */
export async function authenticateMobileUser(
  email: string,
  password: string
): Promise<{ user: MobileUser; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const mobileUser: MobileUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId,
  };

  const token = await generateMobileToken(mobileUser);

  return { user: mobileUser, token };
}

/**
 * Get mobile user from request Authorization header
 * Returns null if not authenticated or token is invalid
 */
export async function getMobileUser(request: Request): Promise<MobileUser | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyMobileToken(token);

  if (!payload) {
    return null;
  }

  // Optionally verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    companyId: payload.companyId,
  };
}

/**
 * Combined auth check - works for both web (session) and mobile (Bearer token)
 * Use this in API routes that need to support both
 */
export async function getAuthUser(request: Request): Promise<MobileUser | null> {
  // First try mobile auth (Bearer token)
  const mobileUser = await getMobileUser(request);
  if (mobileUser) {
    return mobileUser;
  }

  // Fall back to web session auth (imported dynamically to avoid circular deps)
  const { auth } = await import("./auth");
  const session = await auth();

  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
      companyId: session.user.companyId,
    };
  }

  return null;
}
