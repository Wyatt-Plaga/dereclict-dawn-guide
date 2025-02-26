"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface ToastProps {
  id: string
  message: string
  type: "info" | "success" | "warning" | "error"
  duration?: number // in milliseconds
}

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
    
    // Auto remove toast after duration
    if (toast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  // Add to window for global access from anywhere
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - Adding custom property to window
      window.notifications = {
        addToast,
        removeToast,
        // Special method for log unlocking
        newLogUnlocked: () => {
          addToast({
            message: "New ship log entry recovered",
            type: "success",
            duration: 5000 // 5 seconds
          })
        }
      }
    }
    
    return () => {
      if (typeof window !== "undefined") {
        // @ts-ignore - Cleanup
        delete window.notifications
      }
    }
  }, [])

  return (
    <>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`
              system-panel p-4 pr-8 min-w-[260px] max-w-md animate-slideIn
              ${toast.type === 'success' ? 'border-green-500' : ''}
              ${toast.type === 'error' ? 'border-red-500' : ''}
              ${toast.type === 'warning' ? 'border-yellow-500' : ''}
            `}
          >
            <button 
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 opacity-50 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </>
  )
}

// Type declaration for window
declare global {
  interface Window {
    notifications?: {
      addToast: (toast: Omit<ToastProps, "id">) => void
      removeToast: (id: string) => void
      newLogUnlocked: () => void
    }
  }
} 