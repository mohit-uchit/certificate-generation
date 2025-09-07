import jwt from "jsonwebtoken"
import type { UserData } from "@/types/user"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export function generateToken(user: UserData): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.emailId,
      phone: user.mobileNo,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function validatePassword(user: UserData, password: string): boolean {
  // Password is always the phone number
  return user.mobileNo === password
}

export function isValidAdmin(email: string, password: string): boolean {
  return email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD
}
