"use client"

import { useSaveStatus } from "@/components/providers/save-status-provider";
import { SaveIndicator } from "@/components/ui/save-indicator";

export function SaveStatusWrapper() {
  const { status, errorMessage } = useSaveStatus();
  return <SaveIndicator status={status} errorMessage={errorMessage} />;
} 