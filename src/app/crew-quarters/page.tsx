"use client"

import { Users } from "lucide-react"
import WingPage from '@/app/components/WingPage'
import AmmoUpgradePanel from '@/app/components/AmmoUpgradePanel'

export default function CrewQuartersPage() {
  return (
    <WingPage wingId="crewQuarters" icon={Users} flickerKey="crew">
      <AmmoUpgradePanel ammoType="repairKits" />
    </WingPage>
  )
}
