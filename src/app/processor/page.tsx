"use client"

import { CpuIcon } from "lucide-react"
import WingPage from '@/app/components/WingPage'
import AmmoUpgradePanel from '@/app/components/AmmoUpgradePanel'

export default function ProcessorPage() {
  return (
    <WingPage wingId="processor" icon={CpuIcon} flickerKey="processor">
      <AmmoUpgradePanel ammoType="dataCores" />
    </WingPage>
  )
}
