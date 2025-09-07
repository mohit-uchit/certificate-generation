"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, LogOut, User, Phone, Mail, MapPin, GraduationCap } from "lucide-react"
import type { UserData } from "@/types/user"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { CertificatePopup } from "@/components/certificate-popup"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchUserData(token)
  }, [router])

  const fetchUserData = async (token: string) => {
    try {
      console.log("[v0] Dashboard: Fetching user data with token:", token ? "Present" : "Missing")

      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("[v0] Dashboard: API response status:", response.status)
      console.log("[v0] Dashboard: API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Dashboard: Error response:", errorText)
        throw new Error("Failed to fetch user data")
      }

      const result = await response.json()
      console.log("[v0] Dashboard: User data received:", result)
      setUser(result.user)
    } catch (error) {
      console.error("[v0] Dashboard: Error fetching user data:", error)
      toast({
        title: "Session expired",
        description: "Please login again",
        variant: "destructive",
      })
      localStorage.removeItem("auth_token")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    toast({
      title: "Logged out successfully",
      description: "Redirecting to home page...",
    })
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      const result = await response.json()

      setGeneratedCertificateId(result.certificateId)

      toast({
        title: "Certificate generated!",
        description: "Click 'View Certificate' to see your certificate",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    if (user) {
      setUser({ ...user, photoUrl: newPhotoUrl })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfilePhotoUpload
                currentPhotoUrl={user.photoUrl}
                userName={user.name}
                onPhotoUpdated={handlePhotoUpdated}
              />

              <div>
                <h3 className="text-xl font-semibold">
                  {user.title}. {user.name}
                </h3>
                <p className="text-gray-600">{user.courseName}</p>
                <Badge variant="secondary" className="mt-1">
                  Reg. No: {user.registrationNumber}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{user.mobileNo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.emailId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{user.state}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span>{user.collegeName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Experience:</span> {user.experience}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Percentage:</span> {user.passoutPercentage}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateCertificate} className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Certificate
                  </>
                )}
              </Button>

              {generatedCertificateId && (
                <CertificatePopup certificateId={generatedCertificateId}>
                  <Button variant="outline" className="w-full bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                </CertificatePopup>
              )}

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Your certificate will include a QR code for verification</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
