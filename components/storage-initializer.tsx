"use client"

import { useEffect } from "react"

export function StorageInitializer() {
  useEffect(() => {
    // Initialize storage bucket
    const initStorage = async () => {
      try {
        await fetch("/api/storage/setup")
      } catch (error) {
        console.error("Failed to initialize storage:", error)
      }
    }

    initStorage()
  }, [])

  return null
}
