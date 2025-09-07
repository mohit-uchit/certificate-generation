import { type NextRequest, NextResponse } from "next/server"
import { uploadLogo } from "@/lib/cloudinary"
import jwt from "jsonwebtoken"
import fs from "fs/promises"
import path from "path"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"
const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")

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

    // Get form data
    const formData = await request.formData()
    const logo = formData.get("logo") as File

    if (!logo) {
      return NextResponse.json({ error: "Logo file is required" }, { status: 400 })
    }

    // Upload logo
    const logoUrl = await uploadLogo(logo)

    // Save logo URL to settings
    const settings = {
      logoUrl,
      updatedAt: new Date().toISOString(),
    }

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))

    return NextResponse.json({
      success: true,
      message: "Logo updated successfully",
      logoUrl,
    })
  } catch (error) {
    console.error("Logo upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    // Read settings
    try {
      const data = await fs.readFile(SETTINGS_FILE, "utf-8")
      const settings = JSON.parse(data)
      return NextResponse.json({ success: true, settings })
    } catch {
      return NextResponse.json({ success: true, settings: {} })
    }
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
