import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { uploadProfilePhoto, uploadQRCode } from "@/lib/cloudinary"
import { sendEmail, getRegistrationEmailTemplate } from "@/lib/email"
import { getLoginDomain } from "@/lib/url-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Route handler file loaded successfully")
    console.log("[v0] POST handler called - execution started")
    console.log("[v0] ===== REGISTRATION REQUEST START =====")
    console.log("[v0] Request method:", request.method)
    console.log("[v0] Request URL:", request.url)
    console.log("[v0] Request headers:", Object.fromEntries(request.headers.entries()))

    console.log("[v0] Step 0: Connecting to MongoDB...")
    await connectDB()
    console.log("[v0] Connected to MongoDB")
    console.log("[v0] MongoDB connection established")

    console.log("[v0] Step 1: Parsing FormData...")

    let formData: FormData
    try {
      // Clone the request to avoid consuming the body
      const clonedRequest = request.clone()
      formData = await clonedRequest.formData()
      console.log("[v0] FormData parsed successfully")
    } catch (formDataError) {
      console.log("[v0] FormData parsing failed, trying alternative approach...")
      try {
        // Alternative approach: read as array buffer and parse manually
        const body = await request.arrayBuffer()
        const decoder = new TextDecoder()
        const bodyText = decoder.decode(body)
        console.log("[v0] Body length:", body.byteLength)
        console.log("[v0] Body preview:", bodyText.substring(0, 500))

        // For now, return a more specific error
        return NextResponse.json(
          {
            error: "FormData parsing failed. Please try uploading smaller files or contact support.",
            details: "The request body could not be parsed as multipart/form-data",
          },
          { status: 400 },
        )
      } catch (bufferError) {
        console.log("[v0] Buffer reading also failed:", bufferError)
        return NextResponse.json(
          {
            error: "Request body parsing failed completely",
            details: "Unable to read request body",
          },
          { status: 400 },
        )
      }
    }

    console.log("[v0] Step 2: Extracting form fields...")

    const formEntries = Array.from(formData.entries())
    console.log("[v0] Form entries count:", formEntries.length)
    console.log(
      "[v0] Form field names:",
      formEntries.map(([key]) => key),
    )

    // Extract all fields
    const userData = {
      title: formData.get("title") as string,
      name: formData.get("name") as string,
      fatherHusbandName: formData.get("fatherHusbandName") as string,
      mobileNo: formData.get("mobileNo") as string,
      emailId: formData.get("emailId") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      passoutPercentage: Number(formData.get("passoutPercentage")),
      state: formData.get("state") as string,
      address: formData.get("address") as string,
      courseName: formData.get("courseName") as string,
      experience: formData.get("experience") as string,
      collegeName: formData.get("collegeName") as string,
    }

    console.log("[v0] Extracted user data:", userData)

    // Get files
    const photo = formData.get("photo") as File
    const qrCode = formData.get("qrCode") as File | null

    console.log("[v0] Photo file:", photo ? { name: photo.name, size: photo.size, type: photo.type } : "No photo")
    console.log(
      "[v0] QR Code file:",
      qrCode ? { name: qrCode.name, size: qrCode.size, type: qrCode.type } : "No QR code",
    )

    // Basic validation
    if (!userData.name || !userData.emailId || !userData.mobileNo || !photo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (photo.size === 0 || !photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload a valid photo file" }, { status: 400 })
    }

    console.log("[v0] Step 3: Checking for existing user...")
    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ emailId: userData.emailId }, { mobileNo: userData.mobileNo }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    console.log("[v0] Step 4: Uploading photo...")
    // Upload photo
    let photoUrl = ""
    if (photo && photo.size > 0) {
      photoUrl = await uploadProfilePhoto(photo)
      console.log("[v0] Photo uploaded successfully:", photoUrl)
    }

    console.log("[v0] Step 5: Uploading QR code...")
    // Upload QR code if provided
    let qrCodeUrl = ""
    if (qrCode && qrCode.size > 0) {
      try {
        qrCodeUrl = await uploadQRCode(qrCode)
        console.log("[v0] QR code uploaded successfully:", qrCodeUrl)
      } catch (error) {
        console.log("[v0] QR code upload failed, continuing without it")
      }
    }

    console.log("[v0] Step 6: Creating user in database...")
    const year = new Date().getFullYear()
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    const registrationNumber = `MOH${year}${randomNum}`

    // Create user
    const newUser = new User({
      ...userData,
      photoUrl,
      qrCodeUrl,
      registrationNumber, // Explicitly set registration number
      hashedPassword: userData.mobileNo, // Using mobile as password as per requirements
    })

    await newUser.save()
    console.log("[v0] User created successfully with ID:", newUser._id)

    console.log("[v0] Step 7: Sending welcome email...")
    // Send welcome email
    try {
      const loginUrl = getLoginDomain()
      const emailHtml = getRegistrationEmailTemplate(userData.name, loginUrl)

      console.log("[v0] Preparing to send email to:", userData.emailId)
      console.log("[v0] Login URL for email:", loginUrl)

      const emailSent = await sendEmail({
        to: userData.emailId,
        subject: "Registration Successful - Certificate System",
        html: emailHtml,
      })

      if (emailSent) {
        console.log("[v0] Welcome email sent successfully to:", userData.emailId)
      } else {
        console.log("[v0] Email sending failed but registration completed")
      }
    } catch (emailError) {
      console.log("[v0] Email sending failed with error:", emailError)
      console.log("[v0] Registration completed but email not sent")
    }

    console.log("[v0] ===== REGISTRATION SUCCESS =====")
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        registrationNumber: newUser.registrationNumber,
      },
    })
  } catch (error) {
    console.log("[v0] ===== REGISTRATION ERROR =====")
    console.log("[v0] Registration error:", error)
    console.log("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.log("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
    console.log("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json(
      {
        error: "Registration failed. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
