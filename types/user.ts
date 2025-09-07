export interface UserData {
  id: string
  name: string
  title: "Mr" | "Ms"
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
  photoUrl?: string
  qrCodeUrl?: string
  registrationNumber?: string
  createdAt: string
  updatedAt: string
}

export interface CertificateData {
  user: UserData
  certificateId: string
  issueDate: string
  logoUrl?: string
  qrCodeUrl?: string
}

export interface LoginCredentials {
  identifier: string // phone or email
  password: string // always phone number
}

export interface AdminUser {
  email: string
  role: "super_admin"
}
