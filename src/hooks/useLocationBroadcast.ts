import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useLocationBroadcast(driverId: string | null, isOnline: boolean) {
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const watchId = useRef<number | null>(null)

    useEffect(() => {
        if (!driverId || !isOnline) {
            stopWatching()
            return
        }

        startWatching()

        return () => {
            stopWatching()
        }
    }, [driverId, isOnline])

    const startWatching = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser")
            return
        }

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                const newLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
                setLocation(newLoc)
                setError(null)

                // Construct PostGIS POINT string for Supabase
                // Note: PostGIS POINT is formatted as 'POINT(longitude latitude)'
                const pointStr = `POINT(${newLoc.lng} ${newLoc.lat})`

                try {
                    const { error: updateErr } = await supabase
                        .from('drivers')
                        .update({ current_location: pointStr, is_online: true })
                        .eq('id', driverId)

                    if (updateErr) throw updateErr
                } catch (err: any) {
                    console.error("Failed to broadcast location:", err)
                    // We don't set error state here to avoid interrupting the UI if one ping fails
                }
            },
            (err) => {
                console.error("Geolocation error:", err)
                setError(err.message)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000 // Only use location cached up to 5 seconds
            }
        )
    }

    const stopWatching = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current)
            watchId.current = null
        }

        // Mark as offline when stopping brodcast, only if we have a driverId
        if (driverId) {
            supabase
                .from('drivers')
                .update({ is_online: false })
                .eq('id', driverId)
                .then() // Fire and forget
        }
    }

    return { location, error }
}
