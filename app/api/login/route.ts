import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login API called")
    await connectDB()
    console.log("[v0] Connected to MongoDB")

    const { identifier, password } = await request.json()
    console.log("[v0] Login attempt with identifier:", identifier)
    console.log("[v0] Password provided:", password ? "Yes" : "No")

    // Validate input
    if (!identifier || !password) {
      console.log("[v0] Missing identifier or password")
      return NextResponse.json({ error: "Phone/email and password are required" }, { status: 400 })
    }

    console.log("[v0] Searching for user with identifier:", identifier.trim())
    const user = await User.findOne({
      $or: [{ mobileNo: identifier.trim() }, { emailId: identifier.trim() }],
    })

    console.log("[v0] User found:", user ? "Yes" : "No")
    if (user) {
      console.log("[v0] User details - Name:", user.name, "Email:", user.emailId, "Phone:", user.mobileNo)
      console.log("[v0] User MongoDB ID:", user._id.toString())
    }

    if (!user) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found. Please check your phone number or email." }, { status: 404 })
    }

    console.log("[v0] Validating password...")
    const isValidPassword = await user.comparePassword(password)
    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[v0] Invalid password provided")
      return NextResponse.json({ error: "Invalid password. Please use your 10-digit phone number." }, { status: 401 })
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      title: user.title,
      fatherHusbandName: user.fatherHusbandName,
      mobileNo: user.mobileNo,
      emailId: user.emailId,
      dateOfBirth: user.dateOfBirth,
      passoutPercentage: Number.parseFloat(user.passoutPercentage) || 0,
      state: user.state,
      address: user.address,
      courseName: user.courseName,
      experience: user.experience,
      collegeName: user.collegeName,
      photoUrl: user.photoUrl,
      qrCodeUrl: user.qrCodeUrl,
      registrationNumber: user.registrationNumber,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }

    console.log("[v0] Generating token for user:", user._id.toString())
    const token = generateToken(userData)

    console.log("[v0] Login successful for user:", user.name)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.emailId,
        phone: user.mobileNo,
        registrationNumber: user.registrationNumber,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
