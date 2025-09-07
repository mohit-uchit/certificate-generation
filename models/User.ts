import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  _id: string
  title: "Mr" | "Ms"
  name: string
  fatherHusbandName: string
  mobileNo: string
  emailId: string
  dateOfBirth: string
  passoutPercentage: string
  state: string
  address: string
  courseName: string
  experience: string
  collegeName: string
  photoUrl: string
  qrCodeUrl?: string
  registrationNumber: string
  role: "user" | "admin"
  isRestricted: boolean
  hashedPassword: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    title: {
      type: String,
      enum: ["Mr", "Ms"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherHusbandName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    passoutPercentage: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    qrCodeUrl: {
      type: String,
      default: "",
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.hashedPassword)
}

// Generate registration number
UserSchema.pre("save", function (next) {
  if (!this.registrationNumber) {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    this.registrationNumber = `MOH${year}${randomNum}`
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
