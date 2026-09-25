"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";

type Point = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stock: number;
  color: string;
};

const points: Point[] = [
  { id: "gestoci", name: "GESTOCI Vridi", lat: 5.2947, lng: -4.018, stock: 45000, color: "#ff9f43" },
  { id: "cocody", name: "Station Cocody", lat: 5.36, lng: -3.98, stock: 32400, color: "#39d7ff" },
  { id: "marcory", name: "Station Marcory", lat: 5.302, lng: -3.99, stock: 28620, color: "#49e6bb" },
  { id: "yopougon", name: "Station Yopougon", lat: 5.34, lng: -4.08, stock: 25400, color: "#8aa7ff" },
];

const arcs = points.slice(1).map((station) => ({
  startLat: points[0].lat,
  startLng: points[0].lng,
  endLat: station.lat,
  endLng: station.lng,
  color: [points[0].color, station.color],
}));

export default function FuelGlobe({ onSelect }: { onSelect?: (name: string) => void }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.18;
    controls.enablePan = false;
    return () => {
      controls.autoRotate = false;
    };
  }, []);

  return (
    <Globe
      ref={globeRef}
      onGlobeReady={() => globeRef.current?.pointOfView({ lat: 5.32, lng: -4.02, altitude: 1.75 }, 800)}
      width={690}
      height={480}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="/earth-night.jpg"
      bumpImageUrl="/earth-topology.png"
      atmosphereColor="#43b9ff"
      atmosphereAltitude={0.2}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0.025}
      pointRadius={0.35}
      pointLabel={(point) => {
        const item = point as Point;
        return `<div class="globe-tooltip"><strong>${item.name}</strong><br/>${item.stock.toLocaleString("fr-FR")} L</div>`;
      }}
      onPointClick={(point) => onSelect?.((point as Point).name)}
      ringsData={points}
      ringLat="lat"
      ringLng="lng"
      ringColor={(point: object) => () => (point as Point).color}
      ringMaxRadius={2}
      ringPropagationSpeed={1.2}
      ringRepeatPeriod={1150}
      arcsData={arcs}
      arcColor="color"
      arcAltitude={0.18}
      arcStroke={0.8}
      arcDashLength={0.4}
      arcDashGap={0.9}
      arcDashAnimateTime={1800}
    />
  );
}
