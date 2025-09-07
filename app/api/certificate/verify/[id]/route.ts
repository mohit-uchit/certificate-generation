import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Certificate from "@/models/Certificate"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB()
    const certificate = await Certificate.findOne({ certificateId: params.id })

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      exists: true,
      certificateId: certificate.certificateId,
    })
  } catch (error) {
    console.error("Certificate verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
