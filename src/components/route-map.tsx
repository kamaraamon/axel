"use client";

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const gestoci: [number, number] = [5.2947, -4.018];
const incident: [number, number] = [5.317, -4.006];
const station: [number, number] = [5.348, -3.991];

export default function RouteMap({ critical = false }: { critical?: boolean }) {
  return (
    <MapContainer
      center={[5.322, -4.005]}
      zoom={13}
      scrollWheelZoom={false}
      className="route-map"
      aria-label="Carte du trajet GESTOCI vers Station Cocody"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={[gestoci, incident, station]} pathOptions={{ color: "#2B62AC", weight: 5 }} />
      <CircleMarker center={gestoci} radius={8} pathOptions={{ color: "#16A34A", fillOpacity: 1 }}>
        <Popup>GESTOCI — départ 45 000 L</Popup>
      </CircleMarker>
      {critical && (
        <CircleMarker center={incident} radius={11} pathOptions={{ color: "#DC2626", fillOpacity: 0.9 }}>
          <Popup>Variation suspecte : −2 000 L à 09:41</Popup>
        </CircleMarker>
      )}
      <CircleMarker center={station} radius={8} pathOptions={{ color: "#FF7900", fillOpacity: 1 }}>
        <Popup>Station Cocody — arrivée 43 000 L</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
