"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"

interface SuccessDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  showEmailMessage?: boolean
}

export function SuccessDialog({
  open,
  onClose,
  title = "Success!",
  message = "Your request has been processed successfully.",
  showEmailMessage = false,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-center text-gray-700">{message}</p>
          {showEmailMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Check Your Email</span>
              </div>
              <p className="text-sm text-blue-600">
                We've sent your login credentials to your email address. Please check your inbox and spam folder.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
