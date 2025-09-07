import { MongoClient, type Db, type Collection } from "mongodb"
import type { UserData } from "@/types/user"

let client: MongoClient | null = null
let db: Db | null = null

// Connect to MongoDB
async function connectToMongoDB(): Promise<Db> {
  if (db) return db

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db("certificate_system") // You can change this database name
    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Get users collection
async function getUsersCollection(): Promise<Collection<UserData>> {
  const database = await connectToMongoDB()
  return database.collection<UserData>("users")
}

// Get all users
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const collection = await getUsersCollection()
    return await collection.find({}).toArray()
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

// Add new user
export async function addUser(userData: Omit<UserData, "id" | "createdAt" | "updatedAt">): Promise<UserData> {
  try {
    const collection = await getUsersCollection()

    const newUser: UserData = {
      ...userData,
      id: generateUserId(),
      registrationNumber: generateRegistrationNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await collection.insertOne(newUser)
    return newUser
  } catch (error) {
    console.error("Error adding user:", error)
    throw error
  }
}

// Find user by phone or email
export async function findUser(identifier: string): Promise<UserData | null> {
  try {
    const collection = await getUsersCollection()
    const user = await collection.findOne({
      $or: [{ mobileNo: identifier }, { emailId: identifier }],
    })
    return user
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

// Update user
export async function updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
  try {
    const collection = await getUsersCollection()

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const result = await collection.findOneAndUpdate({ id: id }, { $set: updateData }, { returnDocument: "after" })

    return result || null
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

// Generate unique user ID
function generateUserId(): string {
  return `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate registration number
function generateRegistrationNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")
  return `MOH${year}${random}`
}

// Close MongoDB connection (useful for cleanup)
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
