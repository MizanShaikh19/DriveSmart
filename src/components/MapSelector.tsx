import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom tactile pins for Pickup and Dropoff
const createTactileIcon = (color: string, shadowColor: string) => {
    return new L.DivIcon({
        className: 'custom-tactile-icon',
        html: `
            <div style="
                background: ${color}; 
                width: 32px; 
                height: 32px; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg); 
                border: 3px solid white; 
                box-shadow: 0 8px 16px ${shadowColor}, inset 0 2px 4px rgba(255,255,255,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 8px; 
                    height: 8px; 
                    background: white; 
                    border-radius: 50%;
                    transform: rotate(45deg);
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    })
}

const pickupIcon = createTactileIcon('#2563eb', 'rgba(37, 99, 235, 0.3)') // Blue
const dropoffIcon = createTactileIcon('#ea580c', 'rgba(234, 88, 12, 0.3)') // Orange

interface LocationType {
    lat: number
    lng: number
}

interface MapSelectorProps {
    onLocationSelect: (loc: LocationType) => void
    initialLocation?: LocationType | null
    pickupLocation?: LocationType | null
    dropoffLocation?: LocationType | null
    selectingMode: 'pickup' | 'dropoff' | null
    height?: string
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (loc: LocationType) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })
    return null
}

export default function MapSelector({
    onLocationSelect,
    initialLocation,
    pickupLocation,
    dropoffLocation,
    selectingMode,
    height = "400px"
}: MapSelectorProps) {

    const defaultCenter: [number, number] = [28.6139, 77.2090] // New Delhi default
    const mapCenter: [number, number] = initialLocation
        ? [initialLocation.lat, initialLocation.lng]
        : defaultCenter

    return (
        <div
            style={{ height }}
            className="w-full skeuo-inset border-white/80 rounded-[32px] overflow-hidden relative shadow-skeuo-inset bg-slate-100 group"
        >
            <div className="absolute inset-0 skeuo-noise opacity-20 pointer-events-none z-10 select-none"></div>

            {/* Map Interaction Overlay */}
            {selectingMode && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 skeuo-button bg-blue-600 border-white text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-skeuo-md animate-bounce">
                    Select {selectingMode} position
                </div>
            )}

            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />

                {selectingMode && <MapEvents onLocationSelect={onLocationSelect} />}

                {pickupLocation && (
                    <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon} />
                )}

                {dropoffLocation && (
                    <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon} />
                )}
            </MapContainer>

            {/* Decorative Grid */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] z-20 rounded-[32px]"></div>
        </div>
    )
}
