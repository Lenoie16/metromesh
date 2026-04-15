import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import { Activity } from 'lucide-react';

const FALLBACK_COORDS: Record<string, [number, number]> = {
  'Platform A': [51.5300, -0.1236],
  'Platform B': [51.5305, -0.1240],
  'North Concourse': [51.5310, -0.1230],
  'South Exit': [51.5290, -0.1245],
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 18, { animate: true });
  }, [center, map]);
  return null;
}

export function MapDisplay() {
  const { zone, currentDensity, nodes } = useStore();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setGeoError(null);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const center = userLocation || FALLBACK_COORDS[zone] || FALLBACK_COORDS['Platform A'];

  const densityColor = currentDensity === null 
    ? '#888' 
    : currentDensity < 0.4 ? '#00ff95' : currentDensity < 0.7 ? '#ffaa00' : '#ff3c3c';

  return (
    <div className="w-full h-full relative z-0">
      {geoError && !userLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-[#ff3c3c]/20 border border-[#ff3c3c] text-[#ff3c3c] px-4 py-2 rounded text-xs font-mono backdrop-blur-md flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Using fallback location ({geoError})
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={18} 
        zoomControl={false}
        className="w-full h-full bg-[#0a0a0c]"
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
          className="dark-map-tiles"
        />
        <MapUpdater center={center} />
        
        {/* Main Zone / User Marker */}
        <CircleMarker 
          center={center} 
          radius={30} 
          pathOptions={{ 
            color: densityColor, 
            fillColor: densityColor, 
            fillOpacity: 0.2,
            weight: 2
          }}
        >
          <Popup className="font-mono text-xs">
            <strong>{userLocation ? 'Your Live Location' : zone}</strong><br/>
            Density: {currentDensity !== null ? `${Math.round(currentDensity * 100)}%` : 'Unknown'}
          </Popup>
        </CircleMarker>

        {/* Peer Nodes */}
        {nodes.map(node => {
          // Calculate a slight offset based on x/y from radar to simulate geographic spread
          // Radar x/y are roughly -80 to 80. Let's map 80 to ~20 meters (0.0002 degrees)
          const latOffset = (node.y / 400000);
          const lngOffset = (node.x / 400000);
          return (
            <CircleMarker
              key={node.id}
              center={[center[0] + latOffset, center[1] + lngOffset]}
              radius={4}
              pathOptions={{ color: '#00f2ff', fillColor: '#00f2ff', fillOpacity: 0.8, weight: 1 }}
            />
          );
        })}
      </MapContainer>
      
      {/* Overlay gradient to blend map edges into the dark theme */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(10,10,12,1)] z-[400]" />
    </div>
  );
}
