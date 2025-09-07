"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, QrCode } from "lucide-react"
import { SuccessDialog } from "@/components/success-dialog"

interface FormData {
  title: "Mr" | "Ms"
  name: string
  fatherHusbandName: string
  mobileNo: string
  emailId: string
  dateOfBirth: string
  passoutPercentage: number
  state: string
  address: string
  courseName: string
  experience: string
  collegeName: string
  photo: File | null
  qrCode: File | null
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
]

export function RegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "Mr",
    name: "",
    fatherHusbandName: "",
    mobileNo: "",
    emailId: "",
    dateOfBirth: "",
    passoutPercentage: 0,
    state: "",
    address: "",
    courseName: "",
    experience: "",
    collegeName: "",
    photo: null,
    qrCode: null,
  })

  const handleInputChange = (field: keyof FormData, value: string | number | File) => {
    console.log("[v0] Form field changed:", field, typeof value === "object" ? "File" : value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const fieldName = e.target.name as "photo" | "qrCode"

    console.log("[v0] File change event:", fieldName, file?.name, file?.size, file?.type)

    if (file) {
      const maxSize = fieldName === "photo" ? 5 * 1024 * 1024 : 5 * 1024 * 1024 // 5MB for both
      const fieldLabel = fieldName === "photo" ? "Photo" : "QR Code"

      if (file.size > maxSize) {
        toast({
          title: `${fieldLabel} file too large`,
          description: `Please select a ${fieldLabel.toLowerCase()} smaller than 5MB`,
          variant: "destructive",
        })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: `Invalid ${fieldLabel.toLowerCase()} file type`,
          description: `Please select an image file for ${fieldLabel.toLowerCase()}`,
          variant: "destructive",
        })
        return
      }
      console.log("[v0] File validation passed, updating form data")
      handleInputChange(fieldName, file)
    }
  }

  const validateForm = (): boolean => {
    console.log("[v0] Starting form validation")

    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" })
      return false
    }
    if (!formData.fatherHusbandName.trim()) {
      toast({ title: "Father/Husband name is required", variant: "destructive" })
      return false
    }
    if (!/^\d{10}$/.test(formData.mobileNo)) {
      toast({ title: "Please enter a valid 10-digit mobile number", variant: "destructive" })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" })
      return false
    }
    if (!formData.dateOfBirth) {
      toast({ title: "Date of birth is required", variant: "destructive" })
      return false
    }
    if (formData.passoutPercentage < 0 || formData.passoutPercentage > 100) {
      toast({ title: "Please enter a valid percentage (0-100)", variant: "destructive" })
      return false
    }
    if (!formData.state) {
      toast({ title: "Please select your state", variant: "destructive" })
      return false
    }
    if (!formData.address.trim()) {
      toast({ title: "Address is required", variant: "destructive" })
      return false
    }
    if (!formData.courseName.trim()) {
      toast({ title: "Course name is required", variant: "destructive" })
      return false
    }
    if (!formData.experience.trim()) {
      toast({ title: "Experience is required", variant: "destructive" })
      return false
    }
    if (!formData.collegeName.trim()) {
      toast({ title: "College name is required", variant: "destructive" })
      return false
    }
    if (!formData.photo) {
      toast({ title: "Please upload your photo", variant: "destructive" })
      return false
    }
    console.log("[v0] Form validation passed")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submission started")

    if (!validateForm()) {
      console.log("[v0] Form validation failed")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Creating FormData for submission")
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            // Only append files that have actual content
            if (value.size > 0 && value.name && value.type.startsWith("image/")) {
              console.log("[v0] Appending valid file:", key, value.name, value.size, value.type)
              submitData.append(key, value)
            } else {
              console.log("[v0] Skipping invalid/empty file:", key, value.name, value.size, value.type)
            }
          } else {
            console.log("[v0] Appending field:", key, value)
            submitData.append(key, value.toString())
          }
        }
      })

      submitData.append("hasQrCode", formData.qrCode && formData.qrCode.size > 0 ? "true" : "false")

      console.log("[v0] Sending registration request")
      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()
      console.log("[v0] Registration response:", response.status, result)

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      console.log("[v0] Registration successful")
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    router.push("/")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-700">Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Select
                  value={formData.title}
                  onValueChange={(value: "Mr" | "Ms") => handleInputChange("title", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherHusbandName">Father/Husband Name *</Label>
              <Input
                id="fatherHusbandName"
                value={formData.fatherHusbandName}
                onChange={(e) => handleInputChange("fatherHusbandName", e.target.value)}
                placeholder="Enter father/husband name"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobileNo">Mobile Number *</Label>
                <Input
                  id="mobileNo"
                  type="tel"
                  value={formData.mobileNo}
                  onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailId">Email Address *</Label>
                <Input
                  id="emailId"
                  type="email"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passoutPercentage">Pass out Percentage *</Label>
                <Input
                  id="passoutPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.passoutPercentage || ""}
                  onChange={(e) => handleInputChange("passoutPercentage", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter percentage"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name *</Label>
                <Input
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                  placeholder="Enter course name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience *</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="e.g., 2 years"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name *</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => handleInputChange("collegeName", e.target.value)}
                placeholder="Enter college/institution name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.photo ? formData.photo.name : "Click to upload your photo"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCode">Upload QR Code (Optional)</Label>
              <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  id="qrCode"
                  name="qrCode"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="qrCode" className="cursor-pointer">
                  <QrCode className="mx-auto h-12 w-12 text-green-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.qrCode ? formData.qrCode.name : "Click to upload QR code"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (Optional)</p>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Registration Successful!"
        message="Your registration has been completed successfully. You can now login to your account."
        showEmailMessage={true}
      />
    </>
  )
}
