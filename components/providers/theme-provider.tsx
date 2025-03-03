"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Use a simpler approach without trying to type the props
export function ThemeProvider({ 
  children,
  ...props
}: React.PropsWithChildren<Record<string, unknown>>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 