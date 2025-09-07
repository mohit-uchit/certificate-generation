"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ImageIcon } from "lucide-react"

interface LogoUploadProps {
  currentLogoUrl?: string
  onLogoUpdated: (newLogoUrl: string) => void
}

export function LogoUpload({ currentLogoUrl, onLogoUpdated }: LogoUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("logo", file)

      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload logo")
      }

      const result = await response.json()
      onLogoUpdated(result.logoUrl)

      toast({
        title: "Logo updated successfully",
        description: "The certificate logo has been updated",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Certificate Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLogoUrl && (
          <div className="flex justify-center">
            <img
              src={currentLogoUrl || "/placeholder.svg"}
              alt="Current logo"
              className="h-16 w-16 object-contain border rounded"
            />
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
            disabled={isUploading}
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="space-y-2">
              {isUploading ? (
                <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              )}
              <p className="text-sm text-gray-600">{isUploading ? "Uploading..." : "Click to upload logo"}</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
