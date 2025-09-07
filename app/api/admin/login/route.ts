import { type NextRequest, NextResponse } from "next/server"
import { isValidAdmin } from "@/lib/auth"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate admin credentials
    if (!isValidAdmin(email, password)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    // Generate admin JWT token
    const token = jwt.sign(
      {
        email,
        role: "super_admin",
        type: "admin",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
