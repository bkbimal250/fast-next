/**
 * React hook for managing user location
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { getUserLocation, LocationData } from '@/lib/location';

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLocation(autoFetch: boolean = true): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userLocation = await getUserLocation();
      setLocation(userLocation);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get location');
      setError(error);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch, fetchLocation]);

  return {
    location,
    loading,
    error,
    refresh: fetchLocation,
  };
}

