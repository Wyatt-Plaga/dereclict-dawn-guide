"use client"

import { ResourcePage } from "@/components/resources/resource-page"
import { energyConfig } from "@/components/resources/resource-config"

export default function ReactorPage() {
  return <ResourcePage {...energyConfig} />
} 