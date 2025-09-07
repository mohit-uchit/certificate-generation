import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getAllUsers, updateUser } from "@/lib/file-operations"
import { uploadProfilePhoto, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData()
    const photo = formData.get("photo") as File

    if (!photo) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 })
    }

    // Find user
    const users = await getAllUsers()
    const user = users.find((u) => u.id === decoded.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete old photo if exists
    if (user.photoUrl) {
      try {
        const publicId = getPublicIdFromUrl(user.photoUrl)
        await deleteImage(publicId)
      } catch (error) {
        console.warn("Failed to delete old photo:", error)
      }
    }

    // Upload new photo
    const photoUrl = await uploadProfilePhoto(photo)

    // Update user record
    const updatedUser = await updateUser(user.id, { photoUrl })

    return NextResponse.json({
      success: true,
      message: "Photo updated successfully",
      photoUrl,
    })
  } catch (error) {
    console.error("Photo upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
