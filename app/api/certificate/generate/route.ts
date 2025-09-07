import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Certificate from "@/models/Certificate"
import QRCode from "qrcode"
import { sendEmail, getCertificateEmailTemplate } from "@/lib/email"
import { getCertificateUrl } from "@/lib/url-utils"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Certificate generation started")

    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    console.log("[v0] Token verified, user ID:", decoded.id)

    await connectDB()
    const user = await User.findById(decoded.id)

    if (!user) {
      console.log("[v0] User not found for ID:", decoded.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] User found:", user.name)

    // Generate certificate ID
    const certificateId = `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const verificationUrl = getCertificateUrl(certificateId)

    // Generate QR code data (all user details except password)
    const qrData = {
      certificateId,
      name: `${user.title}. ${user.name}`,
      fatherHusbandName: user.fatherHusbandName,
      registrationNumber: user.registrationNumber,
      mobileNo: user.mobileNo,
      emailId: user.emailId,
      dateOfBirth: user.dateOfBirth,
      courseName: user.courseName,
      collegeName: user.collegeName,
      experience: user.experience,
      passoutPercentage: user.passoutPercentage.toString(),
      state: user.state,
      address: user.address,
      issueDate: new Date().toLocaleDateString("en-GB"),
      verificationUrl,
    }

    console.log("[v0] Generating QR code")

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    const certificate = new Certificate({
      certificateId,
      userId: user._id.toString(),
      qrData,
      qrCodeDataUrl,
      createdAt: new Date(),
    })

    await certificate.save()
    console.log("[v0] Certificate saved to MongoDB")

    try {
      const emailHtml = getCertificateEmailTemplate(`${user.title}. ${user.name}`, verificationUrl)

      await sendEmail({
        to: user.emailId,
        subject: "Certificate Generated Successfully",
        html: emailHtml,
      })

      console.log(`[v0] Certificate email sent to ${user.emailId}`)
    } catch (emailError) {
      console.error("[v0] Failed to send certificate email:", emailError)
      // Don't fail certificate generation if email fails
    }

    return NextResponse.json({
      success: true,
      certificateId,
      message: "Certificate generated successfully",
      data: {
        certificateId: certificate.certificateId,
        userId: certificate.userId,
        qrData: certificate.qrData,
        createdAt: certificate.createdAt,
        qrCodeDataUrl: certificate.qrCodeDataUrl,
      },
    })
  } catch (error) {
    console.error("[v0] Certificate generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
