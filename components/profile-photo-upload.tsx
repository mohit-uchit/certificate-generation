"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Camera } from "lucide-react"

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string
  userName: string
  onPhotoUpdated: (newPhotoUrl: string) => void
}

export function ProfilePhotoUpload({ currentPhotoUrl, userName, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
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
      formData.append("photo", file)

      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload photo")
      }

      const result = await response.json()
      onPhotoUpdated(result.photoUrl)

      toast({
        title: "Photo updated successfully",
        description: "Your profile photo has been updated",
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
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentPhotoUrl || "/placeholder.svg"} alt={userName} />
          <AvatarFallback className="text-lg">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="absolute -bottom-2 -right-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
            disabled={isUploading}
          />
          <label htmlFor="photo-upload">
            <Button size="sm" className="h-8 w-8 rounded-full p-0" disabled={isUploading} asChild>
              <span className="cursor-pointer">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Profile Photo</p>
        <p className="text-xs text-gray-500">Click the camera icon to update</p>
      </div>
    </div>
  )
}
