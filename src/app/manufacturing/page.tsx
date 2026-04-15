"use client"

import { Package } from "lucide-react"
import WingPage from '@/app/components/WingPage'
import AmmoUpgradePanel from '@/app/components/AmmoUpgradePanel'

export default function ManufacturingPage() {
  return (
    <WingPage wingId="manufacturing" icon={Package} flickerKey="manufacturing">
      <AmmoUpgradePanel ammoType="munitions" />
    </WingPage>
  )
}
