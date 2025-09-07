import fs from "fs/promises"
import path from "path"
import type { UserData } from "@/types/user"

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")
const BACKUPS_DIR = path.join(DATA_DIR, "backups")

// Ensure data directory exists
export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }

  try {
    await fs.access(BACKUPS_DIR)
  } catch {
    await fs.mkdir(BACKUPS_DIR, { recursive: true })
  }
}

// Read all users from JSON file
export async function getAllUsers(): Promise<UserData[]> {
  await ensureDataDir()

  try {
    const data = await fs.readFile(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save users to JSON file
export async function saveUsers(users: UserData[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Add new user
export async function addUser(userData: Omit<UserData, "id" | "createdAt" | "updatedAt">): Promise<UserData> {
  const users = await getAllUsers()

  const newUser: UserData = {
    ...userData,
    id: generateUserId(),
    registrationNumber: generateRegistrationNumber(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.push(newUser)
  await saveUsers(users)

  return newUser
}

// Find user by phone or email
export async function findUser(identifier: string): Promise<UserData | null> {
  const users = await getAllUsers()
  return users.find((user) => user.mobileNo === identifier || user.emailId === identifier) || null
}

// Update user
export async function updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
  const users = await getAllUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) return null

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await saveUsers(users)
  return users[userIndex]
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

// Create daily backup
export async function createDailyBackup(): Promise<void> {
  const users = await getAllUsers()
  const timestamp = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const backupFile = path.join(BACKUPS_DIR, `users_backup_${timestamp}.json`)

  await fs.writeFile(backupFile, JSON.stringify(users, null, 2))
}
