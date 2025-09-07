import { CertificateView } from "@/components/certificate-view"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Certificate from "@/models/Certificate"
import { notFound } from "next/navigation"

interface CertificatePageProps {
  params: {
    id: string
  }
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  await connectDB()

  const certificate = await Certificate.findOne({ certificateId: params.id })

  if (!certificate) {
    notFound()
  }

  // Find the user data using MongoDB
  const user = await User.findById(certificate.userId)

  if (!user) {
    notFound()
  }

  const certificateData = {
    certificateId: certificate.certificateId,
    user: {
      id: user._id.toString(),
      name: user.name,
      title: user.title,
      emailId: user.emailId,
      mobileNo: user.mobileNo,
      dateOfBirth: user.dateOfBirth,
      fatherHusbandName: user.fatherHusbandName,
      address: user.address,
      state: user.state,
      courseName: user.courseName,
      collegeName: user.collegeName,
      passoutPercentage: Number.parseInt(user.passoutPercentage),
      experience: user.experience,
      registrationNumber: user.registrationNumber,
      photoUrl: user.photoUrl,
    },
    issueDate: certificate.qrData.issueDate,
    qrData: certificate.qrData,
  }

  return <CertificateView data={certificateData} />
}
