import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 text-balance">Certificate Generation System</h1>
          <p className="text-xl text-gray-600 text-pretty max-w-2xl mx-auto">
            Official certificate generation platform for healthcare professionals. Register, login, and generate your
            professional certificates with QR verification.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-700">New Registration</CardTitle>
              <CardDescription>Register as a new healthcare professional to get your certificate</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/register">Register Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-700">Existing User</CardTitle>
              <CardDescription>Login to access your dashboard and generate certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-700">Verify Certificate</CardTitle>
              <CardDescription>Scan QR code or enter certificate ID to verify authenticity</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/verify">Verify Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            For administrative access, visit the{" "}
            <Link href="/admin" className="text-blue-600 hover:underline">
              Admin Panel
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
