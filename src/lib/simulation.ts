import { useStore, HandshakePayload, Trend } from '../store/useStore';

export function simulateHandshake() {
  const store = useStore.getState();
  
  // Generate random node position for radar (-80 to 80)
  const angle = Math.random() * Math.PI * 2;
  const distance = 30 + Math.random() * 50;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  
  const nodeId = Math.random().toString(36).substring(7);
  
  // Add node to radar
  store.addNode({ id: nodeId, x, y });

  // Generate payload
  // If we have a current density, simulate something close to it, otherwise random
  const baseDensity = store.currentDensity ?? (0.2 + Math.random() * 0.6);
  const variance = (Math.random() - 0.5) * 0.2;
  const observed_density = Math.max(0, Math.min(1, baseDensity + variance));
  
  const trends: Trend[] = ['increasing', 'decreasing', 'stable'];
  const trend = trends[Math.floor(Math.random() * trends.length)];

  const payload: HandshakePayload = {
    node_id: `node_${nodeId}`,
    observed_density,
    data_freshness: Math.floor(Math.random() * 10), // 0-10 seconds old
    trend,
    location_hash: store.zone.toLowerCase().replace(' ', '_'),
    timestamp_offset: -Math.floor(Math.random() * 1000)
  };

  store.addLog({
    type: 'handshake',
    message: `Received handshake from ${payload.node_id}`,
    data: payload
  });

  // Process after a slight delay for drama
  setTimeout(() => {
    store.processHandshake(payload);
  }, 600);
}
