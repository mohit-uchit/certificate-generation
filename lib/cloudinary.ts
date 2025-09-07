import { v2 as cloudinary } from "cloudinary"
import type { File } from "formdata-node"
import { Buffer } from "buffer"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
})

export async function uploadImage(file: File, folder = "certificates"): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result?.secure_url || "")
        },
      )
      .end(buffer)
  })
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  try {
    console.log("[v0] Starting profile photo upload, file size:", file.size, "type:", file.type)

    // Validate file
    if (!file) {
      throw new Error("No file provided")
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error("File size too large (max 10MB)")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary configuration missing")
    }

    let buffer: Buffer

    // Check if file has arrayBuffer method (browser File object)
    if (typeof file.arrayBuffer === "function") {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    }
    // Handle Node.js file-like objects that might not have arrayBuffer
    else if (file.stream && typeof file.stream === "function") {
      const chunks: Uint8Array[] = []
      const reader = file.stream().getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      buffer = Buffer.from(combined)
    }
    // Fallback: try to read as buffer directly
    else {
      throw new Error("Unable to read file data - unsupported file format")
    }

    console.log("[v0] File converted to buffer, size:", buffer.length)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "user-photos",
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { format: "auto" },
          ],
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error("[v0] Cloudinary upload error:", error)
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else if (!result?.secure_url) {
            console.error("[v0] No secure URL returned from Cloudinary")
            reject(new Error("Upload completed but no URL returned"))
          } else {
            console.log("[v0] Upload successful, URL:", result.secure_url)
            resolve(result.secure_url)
          }
        },
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error("[v0] Profile photo upload error:", error)
    throw error
  }
}

export async function uploadLogo(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "logos",
          resource_type: "image",
          transformation: [{ width: 200, height: 200, crop: "fit" }, { quality: "auto" }, { format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result?.secure_url || "")
        },
      )
      .end(buffer)
  })
}

export async function uploadQRCode(file: File): Promise<string> {
  try {
    console.log("[v0] Starting QR code upload, file size:", file.size, "type:", file.type)

    // Validate file
    if (!file) {
      throw new Error("No QR code file provided")
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit for QR codes
      throw new Error("QR code file size too large (max 5MB)")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("QR code file must be an image")
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary configuration missing")
    }

    let buffer: Buffer

    // Handle different file object types
    if (typeof file.arrayBuffer === "function") {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    } else if (file.stream && typeof file.stream === "function") {
      const chunks: Uint8Array[] = []
      const reader = file.stream().getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      buffer = Buffer.from(combined)
    } else {
      throw new Error("Unable to read QR code file data - unsupported file format")
    }

    console.log("[v0] QR code file converted to buffer, size:", buffer.length)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "qr_codes",
          resource_type: "image",
          transformation: [{ width: 300, height: 300, crop: "fit" }, { quality: "auto" }, { format: "auto" }],
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error("[v0] Cloudinary QR code upload error:", error)
            reject(new Error(`QR code upload failed: ${error.message}`))
          } else if (!result?.secure_url) {
            console.error("[v0] No secure URL returned from Cloudinary for QR code")
            reject(new Error("QR code upload completed but no URL returned"))
          } else {
            console.log("[v0] QR code upload successful, URL:", result.secure_url)
            resolve(result.secure_url)
          }
        },
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error("[v0] QR code upload error:", error)
    throw error
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/")
  const filename = parts[parts.length - 1]
  const publicId = filename.split(".")[0]
  const folder = parts[parts.length - 2]
  return `${folder}/${publicId}`
}

export { cloudinary }
