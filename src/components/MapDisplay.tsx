import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import { Activity, Navigation } from 'lucide-react';

const FALLBACK_COORDS: Record<string, [number, number]> = {
  'Platform A': [51.5300, -0.1236],
  'Platform B': [51.5305, -0.1240],
  'North Concourse': [51.5310, -0.1230],
  'South Exit': [51.5290, -0.1245],
};

function MapUpdater({ center, trigger }: { center: [number, number], trigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 0.8 });
  }, [center[0], center[1], trigger, map]);
  return null;
}

export function MapDisplay() {
  const { zone, currentDensity, nodes } = useStore();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [centerTrigger, setCenterTrigger] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setGeoError(null);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        setGeoError(error.message);
        setIsLocating(false);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, // Force real-time updates
        timeout: 5000 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleLocateMe = () => {
    if (userLocation) {
      setCenterTrigger(t => t + 1);
    } else {
      setIsLocating(true);
    }
  };

  const center = userLocation || FALLBACK_COORDS[zone] || FALLBACK_COORDS['Platform A'];

  const getZoneDensity = (zName: string) => {
    if (zName === zone) return currentDensity;
    // Deterministic mock density for inactive zones
    let hash = 0;
    for (let i = 0; i < zName.length; i++) hash = zName.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs((Math.sin(hash) * 100) % 1);
  };

  const getDensityColor = (density: number | null) => {
    if (density === null) return '#888';
    if (density < 0.4) return '#00ff95';
    if (density < 0.7) return '#ffaa00';
    return '#ff3c3c';
  };

  return (
    <div className="w-full h-full relative z-0">
      {/* Location Status Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2">
        {geoError && !userLocation && (
          <div className="bg-[#ff3c3c]/90 text-white px-4 py-2 rounded text-xs font-mono shadow-lg flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Using fallback location ({geoError})
          </div>
        )}
        
        <button 
          onClick={handleLocateMe}
          className="bg-[#0a0a0c]/90 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-mono shadow-lg flex items-center gap-2 hover:bg-[#1a1a1f] transition-colors"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-[#00f2ff]' : 'text-[#00f2ff]'}`} />
          {isLocating ? 'Tracking...' : userLocation ? 'Live Tracking Active' : 'Locate Me'}
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={18} 
        zoomControl={true}
        className="w-full h-full bg-[#0a0a0c]"
      >
        {/* Standard Google Maps Tiles - No CSS Invert Filter for a "Proper Map" look */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution="&copy; Google Maps"
        />
        <MapUpdater center={center} trigger={centerTrigger} />
        
        {/* Zone Density Overlays */}
        {Object.entries(FALLBACK_COORDS).map(([zName, coords]) => {
          const density = getZoneDensity(zName);
          const color = getDensityColor(density);
          const isSelected = zName === zone;
          
          return (
            <CircleMarker
              key={zName}
              center={coords}
              radius={isSelected ? 40 : 25}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isSelected ? 0.4 : 0.2,
                weight: isSelected ? 3 : 2,
                dashArray: isSelected ? undefined : '4 4'
              }}
            >
              <Popup className="font-mono text-xs">
                <strong>{zName}</strong> {isSelected && '(Active)'}<br/>
                Density: {density !== null ? `${Math.round(density * 100)}%` : 'Unknown'}
              </Popup>
            </CircleMarker>
          );
        })}

        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={6}
            pathOptions={{ color: '#ffffff', fillColor: '#00f2ff', fillOpacity: 1, weight: 2 }}
          >
            <Popup className="font-mono text-xs">Your Live Location</Popup>
          </CircleMarker>
        )}

        {/* Peer Nodes */}
        {nodes.map(node => {
          // Calculate a slight offset based on x/y from radar to simulate geographic spread
          const latOffset = (node.y / 400000);
          const lngOffset = (node.x / 400000);
          return (
            <CircleMarker
              key={node.id}
              center={[center[0] + latOffset, center[1] + lngOffset]}
              radius={4}
              pathOptions={{ color: '#00f2ff', fillColor: '#00f2ff', fillOpacity: 0.9, weight: 1 }}
            >
              <Popup className="font-mono text-xs">
                Peer Node: {node.id}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Overlay gradient to blend map edges into the dark theme */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(10,10,12,1)] z-[400]" />
    </div>
  );
}
