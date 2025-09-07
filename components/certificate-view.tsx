"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import QRCode from "qrcode"
import type { UserData } from "@/types/user"

interface CertificateData {
  certificateId: string
  user: UserData
  issueDate: string
  qrData: any
}

interface CertificateViewProps {
  data: CertificateData
}

export function CertificateView({ data }: CertificateViewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    // Generate QR code
    QRCode.toDataURL(JSON.stringify(data.qrData), {
      width: 120,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then(setQrCodeUrl)
  }, [data.qrData])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Convert certificate to image and download
    const element = document.getElementById("certificate")
    if (element) {
      // You could use html2canvas here for better image generation
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Action Buttons - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex gap-4 justify-center">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Certificate
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none">
        <div id="certificate" className="p-8 print:p-6">
          {/* Header with Government Logos */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              {/* Indian Government Emblem */}
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src="/indian-government-emblem-ashoka-chakra-national-sy.jpg"
                  alt="Government of India Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">स्वास्थ्य और परिवार कल्याण मंत्रालय</p>
                <p className="text-sm font-semibold text-blue-700">MINISTRY OF HEALTH & FAMILY WELFARE</p>
                <p className="text-xs text-gray-600">भारत सरकार</p>
                <p className="text-xs text-gray-600">GOVERNMENT OF INDIA</p>
                <p className="text-xs text-blue-600">DEPARTMENT OF HEALTH & FAMILY WELFARE</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 border-2 border-gray-300 rounded overflow-hidden">
                <img
                  src={data.user.photoUrl || "/placeholder.svg?height=96&width=80&query=professional headshot photo"}
                  alt={`${data.user.name} Profile Photo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white text-center py-3 mb-6 rounded">
            <h1 className="text-xl font-bold">MEDICAL APPOINTMENT CERTIFICATE</h1>
            <p className="text-sm">Staff Nursing Professional Certification</p>
          </div>

          {/* Registration Number and Barcode */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-semibold">REGISTRATION NUMBER - {data.user.registrationNumber}</p>
              <p className="text-xs text-gray-600">COPY PRINTED FROM DIGITAL CERTIFICATE</p>
            </div>
            <div className="text-right">
              {/* Simple barcode representation */}
              <div className="flex gap-px mb-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="w-1 bg-black" style={{ height: `${Math.random() * 20 + 10}px` }} />
                ))}
              </div>
              <p className="text-xs">{data.user.registrationNumber}</p>
            </div>
          </div>

          {/* Date */}
          <div className="mb-6">
            <p className="text-sm">Date: {data.issueDate}</p>
          </div>

          {/* Recipient Details */}
          <div className="mb-6">
            <p className="text-sm font-semibold">
              Dear {data.user.title}. {data.user.name.toUpperCase()}
            </p>
            <p className="text-xs text-gray-600">
              {data.user.courseName.toUpperCase()} | {data.user.collegeName.toUpperCase()}
            </p>
            <p className="text-xs text-gray-600">
              Father/Husband: {data.user.fatherHusbandName} | DOB: {data.user.dateOfBirth}
            </p>
          </div>

          <div className="mb-8 space-y-4 text-sm leading-relaxed">
            <p>
              <strong>SUBJECT: MEDICAL APPOINTMENT CERTIFICATION FOR NURSING PROFESSIONAL</strong>
            </p>

            <p>
              This is to certify that{" "}
              <strong>
                {data.user.title}. {data.user.name.toUpperCase()}
              </strong>
              , Registration Number <strong>{data.user.registrationNumber}</strong>, has been duly appointed as a
              <strong> Staff Nurse</strong> at{" "}
              <strong>GOVERNMENT PRIMARY HEALTH CENTRE, {data.user.state.toUpperCase()}</strong>.
            </p>

            <p>
              The appointee has successfully completed <strong>{data.user.courseName}</strong> from{" "}
              <strong>{data.user.collegeName}</strong> with <strong>{data.user.passoutPercentage}%</strong> marks and
              has <strong>{data.user.experience}</strong> of relevant experience in the healthcare sector.
            </p>

            <p>
              This appointment is effective from <strong>01 October 2024</strong> and the appointee is authorized to
              perform nursing duties as per the guidelines of the Ministry of Health & Family Welfare, Government of
              India.
            </p>

            <p>
              <strong>Contact Details:</strong>
              <br />
              Mobile: {data.user.mobileNo} | Email: {data.user.emailId}
              <br />
              Address: {data.user.address}
            </p>

            <p>This certificate is issued for official purposes and is valid as per government regulations.</p>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="mb-4">
                <div className="w-32 h-16 border-b border-gray-400 mb-2"></div>
                <p className="text-sm font-semibold">AUTHORIZED SIGNATURE</p>
                <p className="text-sm">DR. RAMESH KUMAR</p>
                <p className="text-xs">Chief Medical Officer</p>
              </div>
            </div>

            {/* Official Seal */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-blue-600 flex items-center justify-center mb-2">
                <div className="text-center">
                  <p className="text-xs font-bold text-blue-600">OFFICIAL</p>
                  <p className="text-xs font-bold text-blue-600">SEAL</p>
                  <p className="text-xs font-bold text-blue-600">GOI</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              {qrCodeUrl && (
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-24 h-24 mx-auto mb-2" />
              )}
              <p className="text-xs text-gray-600">Scan for verification</p>
              <p className="text-xs text-gray-500">{data.certificateId}</p>
            </div>
          </div>

          {/* Footer Logos */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              {/* Digital India Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                <span className="text-xs font-semibold">Digital India</span>
              </div>
            </div>

            {/* Azadi Ka Amrit Mahotsav */}
            <div className="text-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-bold">आज़ादी का</p>
                  <p className="text-xs font-bold">अमृत महोत्सव</p>
                </div>
              </div>
            </div>

            {/* G20 Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">G20</span>
              </div>
              <span className="text-xs font-semibold">Presidency India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details - Hidden in print */}
      <div className="max-w-4xl mx-auto mt-8 print:hidden">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Certificate Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Certificate ID:</strong> {data.certificateId}
              </p>
              <p>
                <strong>Issue Date:</strong> {data.issueDate}
              </p>
              <p>
                <strong>Registration Number:</strong> {data.user.registrationNumber}
              </p>
            </div>
            <div>
              <p>
                <strong>Name:</strong> {data.user.title}. {data.user.name}
              </p>
              <p>
                <strong>Course:</strong> {data.user.courseName}
              </p>
              <p>
                <strong>College:</strong> {data.user.collegeName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Print styles
const printStyles = `
  @media print {
    body { margin: 0; }
    .print\\:hidden { display: none !important; }
    .print\\:shadow-none { box-shadow: none !important; }
    .print\\:max-w-none { max-width: none !important; }
    .print\\:p-6 { padding: 1.5rem !important; }
  }
`

// Inject print styles
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = printStyles
  document.head.appendChild(style)
}
