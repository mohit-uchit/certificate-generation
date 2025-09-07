import nodemailer from "nodemailer"

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true, // SSL/TLS for port 465
    auth: {
      user: process.env.ZOHO_SMTP_USER || "support@healthandwelfareministry.live",
      pass: process.env.ZOHO_SMTP_PASSWORD || "@r4dYimv",
    },
    tls: {
      minVersion: "TLSv1.2", // Minimum TLS version requirement
    },
    debug: true, // Enable debug logs
    logger: true, // Enable logger
  })
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: Buffer
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log("[v0] Attempting to send email to:", options.to)
    console.log("[v0] Email subject:", options.subject)

    const smtpUser = process.env.ZOHO_SMTP_USER || "support@healthandwelfareministry.live"
    const smtpPass = process.env.ZOHO_SMTP_PASSWORD || "@r4dYimv"

    console.log("[v0] Zoho SMTP configured with user:", smtpUser)
    console.log("[v0] Environment variables check:")
    console.log("[v0] - ZOHO_SMTP_USER exists:", !!process.env.ZOHO_SMTP_USER)
    console.log("[v0] - ZOHO_SMTP_PASSWORD exists:", !!process.env.ZOHO_SMTP_PASSWORD)

    const transporter = createTransporter()

    console.log("[v0] Testing SMTP connection...")
    try {
      await transporter.verify()
      console.log("[v0] SMTP connection verified successfully")
    } catch (verifyError) {
      console.error("[v0] SMTP connection verification failed:", verifyError)
      console.error("[v0] This might indicate:")
      console.error("[v0] 1. Incorrect credentials")
      console.error("[v0] 2. Need to enable IMAP/POP in Zoho Mail settings")
      console.error("[v0] 3. Need to use app-specific password")
      console.error("[v0] 4. Account has 2FA enabled")
    }

    const mailOptions = {
      from: `"Certificate System" <${smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    }

    console.log("[v0] Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachments: !!mailOptions.attachments?.length,
    })

    const result = await transporter.sendMail(mailOptions)
    console.log("[v0] Email sent successfully to", options.to)
    console.log("[v0] Email result:", result.messageId)
    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : "Unknown error")

    if (error instanceof Error) {
      if (error.message.includes("535 Authentication Failed")) {
        console.error("[v0] TROUBLESHOOTING: 535 Authentication Failed")
        console.error("[v0] Possible solutions:")
        console.error("[v0] 1. Check if ZOHO_SMTP_USER and ZOHO_SMTP_PASSWORD environment variables are set correctly")
        console.error("[v0] 2. Enable IMAP/POP access in Zoho Mail settings")
        console.error("[v0] 3. Generate and use an app-specific password instead of regular password")
        console.error("[v0] 4. Disable 2FA temporarily or use app password")
        console.error("[v0] 5. Check if the account is locked or suspended")
      }
    }

    return false
  }
}

export function getRegistrationEmailTemplate(name: string, loginUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Successful</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Certificate System!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Registration Successful</h2>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Congratulations! Your registration has been completed successfully. You can now login to your account and generate your certificate.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Login to your account using your phone number or email</li>
              <li>Your password is your phone number</li>
              <li>Generate and download your certificate</li>
              <li>Update your profile photo anytime</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Login Now</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getCertificateEmailTemplate(name: string, certificateUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Certificate Generated</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Certificate Ready!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #28a745; margin-top: 0;">Your Certificate Has Been Generated</h2>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Great news! Your certificate has been successfully generated and is now ready for download.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #28a745;">Certificate Features:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Official government format</li>
              <li>QR code for verification</li>
              <li>Your profile photo included</li>
              <li>Digitally signed and secure</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${certificateUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Certificate</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can share this certificate link or print it for official use. The QR code can be scanned to verify authenticity.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
