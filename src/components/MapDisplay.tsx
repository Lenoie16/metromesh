import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';

const ZONE_COORDS: Record<string, [number, number]> = {
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
  const center = ZONE_COORDS[zone] || ZONE_COORDS['Platform A'];

  const densityColor = currentDensity === null 
    ? '#888' 
    : currentDensity < 0.4 ? '#00ff95' : currentDensity < 0.7 ? '#ffaa00' : '#ff3c3c';

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={18} 
        zoomControl={false}
        className="w-full h-full bg-[#0a0a0c]"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater center={center} />
        
        {/* Main Zone Marker */}
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
            <strong>{zone}</strong><br/>
            Density: {currentDensity !== null ? `${Math.round(currentDensity * 100)}%` : 'Unknown'}
          </Popup>
        </CircleMarker>

        {/* Peer Nodes */}
        {nodes.map(node => {
          // Calculate a slight offset based on x/y from radar to simulate geographic spread
          const latOffset = (node.y / 100000);
          const lngOffset = (node.x / 100000);
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
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(10,10,12,1)]" />
    </div>
  );
}
