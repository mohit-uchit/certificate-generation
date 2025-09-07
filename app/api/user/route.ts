import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] User API route called")

    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header:", authHeader ? "Present" : "Missing")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No valid authorization header")
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log("[v0] Token extracted:", token ? "Present" : "Missing")

    const decoded = verifyToken(token)
    console.log("[v0] Token decoded:", decoded ? "Success" : "Failed")

    if (!decoded) {
      console.log("[v0] Invalid or expired token")
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    await connectDB()
    console.log("[v0] Connected to MongoDB")

    const user = await User.findById(decoded.id).select("-password")
    console.log("[v0] User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Returning user data successfully")
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("[v0] User fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
