import { type NextRequest, NextResponse } from "next/server"
import { isValidAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Admin login attempt started")
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Validating admin credentials against env variables")
    // Validate admin credentials against environment variables
    if (!isValidAdmin(email, password)) {
      console.log("[v0] Invalid admin credentials")
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    console.log("[v0] Connecting to database")
    await connectDB()

    // Check if super admin user exists in database
    let superAdmin = await User.findOne({ emailId: email })
    console.log("[v0] Super admin found in database:", !!superAdmin)

    // If super admin doesn't exist, create it automatically
    if (!superAdmin) {
      console.log("[v0] Super admin not found in database, creating automatically...")

      superAdmin = new User({
        title: "Mr",
        name: "Super Administrator",
        fatherHusbandName: "System Administrator",
        emailId: email,
        mobileNo: password.padStart(10, "0").slice(0, 10), // Ensure 10 digits for mobile
        dateOfBirth: "1990-01-01",
        passoutPercentage: "100",
        state: "System",
        address: "Admin Address",
        courseName: "System Administration",
        experience: "10+ years",
        collegeName: "System College",
        photoUrl: "/admin-avatar.png",
        role: "admin", // Changed from "super_admin" to "admin" as per schema
        hashedPassword: password, // Added hashedPassword field (will be hashed by pre-save hook)
      })

      await superAdmin.save()
      console.log("[v0] Super admin created successfully in database")
    }

    console.log("[v0] Generating JWT token for super admin")
    // Generate admin JWT token
    const token = jwt.sign(
      {
        id: superAdmin._id.toString(),
        email: superAdmin.emailId,
        role: "admin",
        type: "admin",
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    console.log("[v0] Admin login successful")
    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      token,
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
