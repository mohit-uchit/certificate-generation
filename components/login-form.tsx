"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Phone, Mail } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "", // phone or email
    password: "", // phone number
  })

  useEffect(() => {
    const email = searchParams.get("email")
    const pass = searchParams.get("pass")

    if (email && pass) {
      setFormData({
        identifier: email,
        password: pass,
      })
      // Auto-login if both parameters are present
      handleAutoLogin(email, pass)
    }
  }, [searchParams])

  const handleAutoLogin = async (email: string, password: string) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Login failed")
      }

      // Store JWT token
      localStorage.setItem("auth_token", result.token)

      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      toast({
        title: "Auto-login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.identifier.trim()) {
      toast({ title: "Please enter your phone number or email", variant: "destructive" })
      return false
    }
    if (!formData.password.trim()) {
      toast({ title: "Please enter your password", variant: "destructive" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Login failed")
      }

      // Store JWT token
      localStorage.setItem("auth_token", result.token)

      toast({
        title: "Login successful!",
        description: "Redirecting to dashboard...",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEmail = formData.identifier.includes("@")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-blue-700">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier">Phone Number or Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isEmail ? <Mail className="h-4 w-4 text-gray-400" /> : <Phone className="h-4 w-4 text-gray-400" />}
              </div>
              <Input
                id="identifier"
                type="text"
                value={formData.identifier}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
                placeholder="Enter phone number or email"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Use your registered phone number or email address</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your phone number"
              required
            />
            <p className="text-xs text-gray-500">Your password is your 10-digit phone number</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
