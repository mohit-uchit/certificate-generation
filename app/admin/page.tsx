import { AdminLogin } from "@/components/admin-login"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600 text-pretty">Super Administrator Access</p>
        </div>
        <AdminLogin />
      </div>
    </div>
  )
}
