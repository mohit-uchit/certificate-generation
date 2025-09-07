import { type NextRequest, NextResponse } from "next/server"
import { createDailyBackup } from "@/lib/file-operations"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      if (decoded.role !== "super_admin") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    await createDailyBackup()

    return NextResponse.json({
      success: true,
      message: "Backup created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin backup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
