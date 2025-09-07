"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogOut, Users, FileText, Download, Edit, Search, Calendar, Shield } from "lucide-react"
import type { UserData } from "@/types/user"
import { UserEditDialog } from "@/components/user-edit-dialog"
import { LogoUpload } from "@/components/logo-upload"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin")
      return
    }

    fetchUsers(token)
    fetchLogo(token)
  }, [router])

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNo.includes(searchTerm) ||
        user.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const result = await response.json()
      setUsers(result.users)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Session expired",
        description: "Please login again",
        variant: "destructive",
      })
      localStorage.removeItem("admin_token")
      router.push("/admin")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogo = async (token: string) => {
    try {
      const response = await fetch("/api/admin/logo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setLogoUrl(result.settings?.logoUrl || "")
      }
    } catch (error) {
      console.warn("Failed to fetch logo:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    toast({
      title: "Logged out successfully",
      description: "Redirecting to admin login...",
    })
    setTimeout(() => {
      router.push("/admin")
    }, 1000)
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleGenerateCertificate = async (user: UserData) => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/certificate/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      const result = await response.json()

      toast({
        title: "Certificate generated!",
        description: "Opening certificate in new tab...",
      })

      // Open certificate in new tab
      window.open(`/certificate/${result.certificateId}`, "_blank")
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleCreateBackup = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create backup")
      }

      toast({
        title: "Backup created successfully",
        description: "Daily backup has been saved",
      })
    } catch (error) {
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleUserUpdated = (updatedUser: UserData) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    toast({
      title: "User updated successfully",
      description: `${updatedUser.name}'s details have been updated`,
    })
  }

  const handleLogoUpdated = (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Certificate Management System</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Available to generate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button onClick={handleCreateBackup} size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
            </CardContent>
          </Card>

          {/* Logo Management Card */}
          <LogoUpload currentLogoUrl={logoUrl} onLogoUpdated={handleLogoUpdated} />
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Management</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-gray-600">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {user.title}. {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.emailId}</p>
                      <p className="text-sm text-gray-600">{user.mobileNo}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{user.courseName}</Badge>
                        <Badge variant="outline">{user.registrationNumber}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleGenerateCertificate(user)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Certificate
                    </Button>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No users found matching your search." : "No users registered yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Edit Dialog */}
      {selectedUser && (
        <UserEditDialog
          user={selectedUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}
