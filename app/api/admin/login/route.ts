import { type NextRequest, NextResponse } from "next/server"
import { isValidAdmin } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate admin credentials against environment variables
    if (!isValidAdmin(email, password)) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    await connectDB()

    // Check if super admin user exists in database
    let superAdmin = await User.findOne({ emailId: email })

    // If super admin doesn't exist, create it automatically
    if (!superAdmin) {
      console.log("[v0] Super admin not found in database, creating automatically...")

      superAdmin = new User({
        fullName: "Super Administrator",
        emailId: email,
        mobileNo: password, // Using password as mobile number for super admin
        dateOfBirth: new Date("1990-01-01"), // Default DOB
        gender: "Other",
        address: "Admin Address",
        qualification: "Administrator",
        passoutPercentage: "100",
        role: "super_admin",
      })

      await superAdmin.save()
      console.log("[v0] Super admin created successfully in database")
    }

    // Generate admin JWT token
    const token = jwt.sign(
      {
        id: superAdmin._id.toString(),
        email: superAdmin.emailId,
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
