import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole, UserStatus } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export interface JwtPayload {
  id: string;
  role: UserRole;
  status: UserStatus;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export async function verifyAuth(
  request: NextRequest,
  allowedRoles: UserRole[] = []
): Promise<JwtPayload> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED: Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      throw new Error("FORBIDDEN: Insufficient privileges");
    }

    if (decoded.status === UserStatus.INACTIVE) {
      throw new Error("FORBIDDEN: Account is inactive");
    }

    return decoded;
  } catch (error: any) {
    if (error.message.startsWith("FORBIDDEN") || error.message.startsWith("UNAUTHORIZED")) {
      throw error;
    }
    throw new Error("UNAUTHORIZED: Invalid or expired token");
  }
}
