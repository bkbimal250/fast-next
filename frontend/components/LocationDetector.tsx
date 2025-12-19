/**
 * Location detector component - Gets user's geolocation and reverse geocodes it
 * Uses backend API for reverse geocoding with caching
 */

'use client'

import { useEffect, useState } from 'react'
import { getUserLocation, LocationData } from '@/lib/location'

interface LocationDetectorProps {
  onLocationDetected?: (location: LocationData) => void
  onError?: (error: Error) => void
  autoDetect?: boolean
}

export default function LocationDetector({
  onLocationDetected,
  onError,
  autoDetect = true,
}: LocationDetectorProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState<boolean>(autoDetect)
  
  useEffect(() => {
    if (!autoDetect) return

    setLoading(true)
    getUserLocation()
      .then((loc) => {
        if (loc) {
          setLocation(loc)
          onLocationDetected?.(loc)
        }
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to detect location')
        onError?.(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [autoDetect, onLocationDetected, onError])
  
  // This component doesn't render anything by default
  // It just tracks location and calls callbacks
  return null
}

export type { LocationData }

