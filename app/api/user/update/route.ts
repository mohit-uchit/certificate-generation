import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { updateUser, findUser } from "@/lib/mongodb-operations"

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const body = await request.json()
    const { name, emailId, mobileNo, state, collegeName, experience, passoutPercentage } = body

    // Validate required fields
    if (!name || !emailId || !mobileNo || !state || !collegeName || !experience || passoutPercentage === undefined) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if email or mobile is already taken by another user
    const existingUser = await findUser(emailId)
    if (existingUser && existingUser.id !== decoded.id) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const existingMobile = await findUser(mobileNo)
    if (existingMobile && existingMobile.id !== decoded.id) {
      return NextResponse.json({ error: "Mobile number already registered" }, { status: 400 })
    }

    // Update user
    const updatedUser = await updateUser(decoded.id, {
      name,
      emailId,
      mobileNo,
      state,
      collegeName,
      experience,
      passoutPercentage: Number.parseFloat(passoutPercentage),
    })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
