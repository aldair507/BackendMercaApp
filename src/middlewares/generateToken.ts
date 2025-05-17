import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/server.config";

export function generateToken(userId: string, rol: string): string {
  return jwt.sign(
    { id: userId, rol },
    JWT_SECRET!,
    { expiresIn: "1h" } // Token expira en 1 día
  );
}
