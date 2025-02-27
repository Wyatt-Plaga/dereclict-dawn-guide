"use client"

import { useEffect, useState, ReactNode } from "react"
import { X } from "lucide-react"

interface ToastProps {
  id: string
  message: string | ReactNode  // Allow React nodes as messages
  type: "info" | "success" | "warning" | "error"
  duration?: number // in milliseconds
  category?: string // Category for grouping related toasts
}

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    // If category is specified, remove any existing toasts with the same category
    if (toast.category) {
      setToasts(prev => {
        // Filter out any existing toasts with the same category
        const filtered = prev.filter(t => t.category !== toast.category);
        // Add the new toast
        return [...filtered, { ...toast, id }];
      });
    } else {
      // Regular behavior for toasts without category
      setToasts(prev => [...prev, { ...toast, id }]);
    }
    
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
  
  // Method to add a custom JSX notification
  const addCustomNotification = (
    content: ReactNode, 
    type: "info" | "success" | "warning" | "error" = "info", 
    duration = 5000,
    category?: string
  ) => {
    addToast({
      message: content,
      type,
      duration,
      category
    });
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
            duration: 5000, // 5 seconds
            category: "log-unlock"
          })
        },
        // Custom notification method
        addCustomNotification
      }
    }
    
    // For debugging
    console.log("NotificationsProvider initialized with methods:", 
      typeof window !== "undefined" ? 
      Object.keys(window.notifications || {}).join(", ") : 
      "window not available");
    
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
            <div className="text-sm">
              {typeof toast.message === 'string' 
                ? <p>{toast.message}</p> 
                : toast.message
              }
            </div>
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
      addCustomNotification: (
        content: ReactNode, 
        type?: "info" | "success" | "warning" | "error", 
        duration?: number,
        category?: string
      ) => void
    }
  }
} 