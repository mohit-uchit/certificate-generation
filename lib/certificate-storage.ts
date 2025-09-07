import fs from "fs/promises"
import path from "path"

const CERTIFICATES_DIR = path.join(process.cwd(), "data")
const CERTIFICATES_FILE = path.join(CERTIFICATES_DIR, "certificates.json")

export interface StoredCertificate {
  certificateId: string
  userId: string
  qrData: any
  createdAt: string
  qrCodeDataUrl: string
}

// Ensure certificates directory exists
export async function ensureCertificatesDir() {
  try {
    await fs.access(CERTIFICATES_DIR)
  } catch {
    await fs.mkdir(CERTIFICATES_DIR, { recursive: true })
  }
}

// Read all certificates from JSON file
export async function getAllCertificates(): Promise<StoredCertificate[]> {
  await ensureCertificatesDir()

  try {
    const data = await fs.readFile(CERTIFICATES_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Save certificates to JSON file
export async function saveCertificates(certificates: StoredCertificate[]): Promise<void> {
  await ensureCertificatesDir()
  await fs.writeFile(CERTIFICATES_FILE, JSON.stringify(certificates, null, 2))
}

// Add new certificate
export async function addCertificate(certificateData: StoredCertificate): Promise<void> {
  const certificates = await getAllCertificates()
  certificates.push(certificateData)
  await saveCertificates(certificates)
}

// Find certificate by ID
export async function findCertificate(certificateId: string): Promise<StoredCertificate | null> {
  const certificates = await getAllCertificates()
  return certificates.find((cert) => cert.certificateId === certificateId) || null
}
