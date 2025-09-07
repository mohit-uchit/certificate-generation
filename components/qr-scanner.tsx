"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { isValidRedirectUrl } from "@/lib/url-utils"

export function QRScanner() {
  const router = useRouter()
  const { toast } = useToast()
  const [certificateId, setCertificateId] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast({
        title: "Certificate ID required",
        description: "Please enter a certificate ID to verify",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      // Check if certificate exists
      const response = await fetch(`/api/certificate/verify/${certificateId}`)

      if (response.ok) {
        router.push(`/verify/${certificateId}`)
      } else {
        toast({
          title: "Certificate not found",
          description: "The certificate ID you entered could not be found",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleQRData = (qrData: string) => {
    try {
      const data = JSON.parse(qrData)
      if (data.certificateId) {
        router.push(`/verify/${data.certificateId}`)
      } else if (data.verificationUrl) {
        if (isValidRedirectUrl(data.verificationUrl)) {
          window.location.href = data.verificationUrl
        } else {
          toast({
            title: "Invalid verification URL",
            description: "The QR code contains an invalid verification URL",
            variant: "destructive",
          })
        }
      }
    } catch {
      // If not JSON, treat as certificate ID
      setCertificateId(qrData)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Verify Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="certificateId">Certificate ID</Label>
          <Input
            id="certificateId"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Enter certificate ID (e.g., CERT_1234567890_abc123)"
          />
        </div>

        <Button onClick={handleVerify} className="w-full" disabled={isVerifying}>
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Verify Certificate
            </>
          )}
        </Button>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Scan the QR code on a certificate or enter the certificate ID manually
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
