"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CertificateView } from "@/components/certificate-view"
import { FileText, ExternalLink } from "lucide-react"
import type { UserData } from "@/types/user"

interface CertificateData {
  certificateId: string
  user: UserData
  issueDate: string
  qrData: any
}

interface CertificatePopupProps {
  certificateId: string
  children?: React.ReactNode
}

export function CertificatePopup({ certificateId, children }: CertificatePopupProps) {
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const fetchCertificateData = async () => {
    if (certificateData) return // Already loaded

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/certificate/verify/${certificateId}`)
      if (!response.ok) {
        throw new Error("Certificate not found")
      }

      const data = await response.json()
      setCertificateData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certificate")
    } finally {
      setIsLoading(false)
    }
  }

  const openInNewTab = () => {
    window.open(`/certificate/${certificateId}`, "_blank")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetchCertificateData()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Certificate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Medical Appointment Certificate</DialogTitle>
          <DialogDescription>Certificate ID: {certificateId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <p>Loading certificate...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchCertificateData} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {certificateData && (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <Button onClick={openInNewTab} variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
              <CertificateView data={certificateData} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
