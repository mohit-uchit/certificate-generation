import { QRScanner } from "@/components/qr-scanner"

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gray-600 text-pretty">
            Verify the authenticity of certificates by scanning QR codes or entering certificate IDs
          </p>
        </div>
        <QRScanner />
      </div>
    </div>
  )
}
