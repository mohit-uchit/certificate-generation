import mongoose, { Schema, type Document } from "mongoose"

export interface ICertificate extends Document {
  certificateId: string
  userId: string
  qrData: {
    certificateId: string
    name: string
    fatherHusbandName: string
    registrationNumber: string
    mobileNo: string
    emailId: string
    dateOfBirth: string
    courseName: string
    collegeName: string
    experience: string
    passoutPercentage: string
    state: string
    address: string
    issueDate: string
    verificationUrl: string
  }
  qrCodeDataUrl: string
  createdAt: Date
}

const CertificateSchema: Schema = new Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  qrData: {
    certificateId: String,
    name: String,
    fatherHusbandName: String,
    registrationNumber: String,
    mobileNo: String,
    emailId: String,
    dateOfBirth: String,
    courseName: String,
    collegeName: String,
    experience: String,
    passoutPercentage: String,
    state: String,
    address: String,
    issueDate: String,
    verificationUrl: String,
  },
  qrCodeDataUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema)
