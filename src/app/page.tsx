"use client"

import Link from "next/link"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { NavBar } from "@/components/ui/navbar"
import GameLoader from '@/app/components/GameLoader'

export default function HomePage() {
  const { shouldFlicker } = useSystemStatus();
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        {/* Rest of component content */}
      </main>
    </GameLoader>
  )
}
