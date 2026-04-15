import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip, useMap } from 'react-leaflet';
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
  const [trackingMode, setTrackingMode] = useState<'demo' | 'live'>('demo');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [centerTrigger, setCenterTrigger] = useState(0);

  useEffect(() => {
    if (trackingMode === 'demo') {
      setUserLocation(null);
      setLocationAccuracy(null);
      setGeoError(null);
      setIsLocating(false);
      return;
    }

    setIsLocating(true);

    // Fallback function using IP-based geolocation API
    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setUserLocation([data.latitude, data.longitude]);
          setLocationAccuracy(5000); // IP location is very imprecise, estimate 5km radius
          setGeoError("Using IP-based location (Browser GPS blocked)");
        } else {
          setGeoError("Could not determine location");
        }
      } catch (err) {
        setGeoError("Location services unavailable");
      } finally {
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationAccuracy(position.coords.accuracy);
        setGeoError(null);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        // If it fails (e.g., due to secure origin iframe restrictions), fallback to IP
        fetchIpLocation();
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0,
        timeout: 5000 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingMode]);

  const center = trackingMode === 'live' && userLocation 
    ? userLocation 
    : (FALLBACK_COORDS[zone] || FALLBACK_COORDS['Platform A']);

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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-auto">
        {trackingMode === 'live' && (
          <div className="bg-[#ffaa00]/90 text-black px-4 py-2 rounded text-xs font-mono shadow-lg flex flex-col items-center gap-2 w-full max-w-sm">
            {geoError ? (
              <div className="flex items-center gap-2 font-bold text-center">
                <Activity className="w-4 h-4 shrink-0" />
                {geoError}
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-center">
                <Navigation className="w-4 h-4 shrink-0" />
                Live Tracking Active
              </div>
            )}
            
            <button 
              onClick={() => window.open(window.location.href, '_blank')}
              className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition-colors w-full text-center font-bold shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/20"
            >
              🚀 Open in New Tab for Precise GPS
            </button>
            <div className="text-[9px] opacity-70 text-center leading-tight">
              (In-app preview blocks precise GPS. Open in a new tab for street-level accuracy during your presentation.)
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setTrackingMode('demo');
              setCenterTrigger(t => t + 1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono shadow-lg flex items-center gap-2 transition-colors ${
              trackingMode === 'demo' 
                ? 'bg-[#00f2ff] text-black font-bold' 
                : 'bg-[#0a0a0c]/90 border border-white/20 text-white hover:bg-[#1a1a1f]'
            }`}
          >
            Demo Mode (London)
          </button>
          
          <button 
            onClick={() => {
              setTrackingMode('live');
              if (trackingMode === 'live' && userLocation) setCenterTrigger(t => t + 1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono shadow-lg flex items-center gap-2 transition-colors ${
              trackingMode === 'live' 
                ? 'bg-[#00f2ff] text-black font-bold' 
                : 'bg-[#0a0a0c]/90 border border-white/20 text-white hover:bg-[#1a1a1f]'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isLocating && trackingMode === 'live' ? 'animate-spin' : ''}`} />
            {trackingMode === 'live' && isLocating ? 'Locating...' : 'Live Location'}
          </button>
        </div>

        {trackingMode === 'live' && locationAccuracy && (
          <div className="text-[10px] font-mono bg-[#0a0a0c]/90 text-[#00f2ff] px-3 py-1 rounded-full border border-[#00f2ff]/30 shadow-lg backdrop-blur-sm">
            Accuracy: ~{Math.round(locationAccuracy)} meters
          </div>
        )}
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
          <>
            {locationAccuracy && (
              <Circle
                center={userLocation}
                radius={locationAccuracy}
                pathOptions={{ color: '#0088ff', fillColor: '#0088ff', fillOpacity: 0.15, weight: 1 }}
              />
            )}
            <CircleMarker
              center={userLocation}
              radius={7}
              pathOptions={{ color: '#ffffff', fillColor: '#0088ff', fillOpacity: 1, weight: 2 }}
            >
              <Popup className="font-mono text-xs">
                <strong>Your Live Location</strong><br/>
                Accuracy: {locationAccuracy ? `~${Math.round(locationAccuracy)} meters` : 'Unknown'}
              </Popup>
            </CircleMarker>
          </>
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
              {node.density !== undefined && (
                <Tooltip 
                  permanent 
                  direction="right" 
                  offset={[5, 0]}
                  className="bg-transparent border-none shadow-none p-0 m-0"
                >
                  <div className="text-[10px] font-mono text-[#00f2ff] bg-[#00f2ff]/10 px-1 rounded border border-[#00f2ff]/20 backdrop-blur-sm">
                    {Math.round(node.density * 100)}%
                  </div>
                </Tooltip>
              )}
              <Popup className="font-mono text-xs">
                Peer Node: {node.id}<br/>
                Observed Density: {node.density !== undefined ? `${Math.round(node.density * 100)}%` : 'Unknown'}
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
