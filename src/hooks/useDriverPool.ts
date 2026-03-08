import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { parsePostgresPoint } from '@/lib/geoUtils';
import type { Coordinates } from '@/lib/geoUtils';

export interface DriverNode {
    id: string;
    is_online: boolean;
    activity_state: 'driving' | 'resting' | 'refilling' | 'maintenance';
    current_location: Coordinates | null;
    full_name: string;
}

/**
 * Hook to fetch and subscribe to online drivers
 * @param limit Optional limit for nodes
 */
export function useDriverPool(limit: number = 30) {
    const [drivers, setDrivers] = useState<DriverNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();

        const channel = supabase
            .channel('driver-pool-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'drivers'
            }, () => {
                fetchDrivers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDrivers = async () => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select(`
          id, 
          is_online, 
          activity_state,
          current_location,
          profiles:id(full_name)
        `)
                .eq('is_online', true)
                .limit(limit);

            if (error) throw error;

            const parsed: DriverNode[] = (data || []).map((d: any) => ({
                id: d.id,
                is_online: d.is_online,
                activity_state: d.activity_state || 'driving',
                current_location: parsePostgresPoint(d.current_location),
                full_name: d.profiles?.full_name || 'System Node'
            }));

            setDrivers(parsed);
        } catch (err) {
            console.error('Driver Pool Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { drivers, loading, refetch: fetchDrivers };
}
