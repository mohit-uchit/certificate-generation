import { RegistrationForm } from "@/components/registration-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Registration</h1>
          <p className="text-gray-600 text-pretty">
            Complete your registration to generate your professional certificate
          </p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  )
}
