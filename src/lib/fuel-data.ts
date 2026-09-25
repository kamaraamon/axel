import type { AlertStatus } from "@/lib/workflows";

export type Trip = {
  id: string;
  status: string;
  route: string;
  volume: number;
  delta: number | null;
  driver: string;
};

export type Station = {
  id: string;
  name: string;
  stock: number;
  capacity: number;
  status: string;
  color: string;
};

export type FuelAlert = {
  id: string;
  severity: "Critique" | "Technique" | "Avertissement";
  title: string;
  details: string;
  status: AlertStatus;
};

export type FuelSnapshot = {
  trips: Trip[];
  stations: Station[];
  alerts: FuelAlert[];
};

export const INITIAL_TRIPS: Trip[] = [
  { id: "PF-2026-0925", status: "En route", route: "GESTOCI → Cocody", volume: 45000, delta: null, driver: "Yao Kouassi" },
  { id: "PF-2026-0924", status: "Clôturé", route: "GESTOCI → Marcory", volume: 36000, delta: -90, driver: "Adama Traoré" },
  { id: "PF-2026-0923", status: "Clôturé", route: "GESTOCI → Yopougon", volume: 42000, delta: 20, driver: "Yao Kouassi" },
  { id: "PF-2026-0922", status: "Clôturé", route: "GESTOCI → Cocody", volume: 45000, delta: -110, driver: "Adama Traoré" },
];

export const INITIAL_STATIONS: Station[] = [
  { id: "ST-CY", name: "Station Cocody", stock: 32400, capacity: 50000, status: "Opérationnelle", color: "#FF7900" },
  { id: "ST-MY", name: "Station Marcory", stock: 28620, capacity: 40000, status: "Opérationnelle", color: "#2B62AC" },
  { id: "ST-YN", name: "Station Yopougon", stock: 25400, capacity: 36000, status: "Niveau bas", color: "#F59E0B" },
];

export const INITIAL_ALERTS: FuelAlert[] = [
  { id: "ALT-001", severity: "Critique", title: "Baisse de 2 000 L hors zone autorisée", details: "CI 01 AB 4521 · Boulevard de Vridi · 09:41", status: "open" },
  { id: "ALT-002", severity: "Technique", title: "Batterie sonde C4 sous 20 %", details: "Camion CI 02 BB 7480 · il y a 2 h", status: "open" },
];

const SEVERITIES = new Set(["Critique", "Technique", "Avertissement"]);
const ALERT_STATUSES = new Set(["open", "acknowledged"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function whole(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function parseTrip(value: unknown): Trip | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const status = text(value.status);
  const route = text(value.route);
  const volume = whole(value.volume);
  const driver = text(value.driver);
  const delta = value.delta === null ? null : whole(value.delta);
  if (!id || !status || !route || volume === null || !driver || delta === undefined) return null;
  return { id, status, route, volume, delta, driver };
}

function parseStation(value: unknown): Station | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const name = text(value.name);
  const stock = whole(value.stock);
  const capacity = whole(value.capacity);
  const status = text(value.status);
  const color = text(value.color);
  if (!id || !name || stock === null || capacity === null || !status || !color) return null;
  return { id, name, stock, capacity, status, color };
}

function parseAlert(value: unknown): FuelAlert | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const title = text(value.title);
  const details = text(value.details);
  const severity = value.severity;
  const status = value.status;
  if (!id || !title || !details) return null;
  if (typeof severity !== "string" || !SEVERITIES.has(severity)) return null;
  if (typeof status !== "string" || !ALERT_STATUSES.has(status)) return null;
  return { id, severity: severity as FuelAlert["severity"], title, details, status: status as AlertStatus };
}

export function parseFuelSnapshot(value: unknown): FuelSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.trips) || !Array.isArray(value.stations) || !Array.isArray(value.alerts)) {
    return null;
  }
  const trips = value.trips.map(parseTrip);
  const stations = value.stations.map(parseStation);
  const alerts = value.alerts.map(parseAlert);
  if (trips.some((item) => item === null) || stations.some((item) => item === null) || alerts.some((item) => item === null)) {
    return null;
  }
  return { trips: trips as Trip[], stations: stations as Station[], alerts: alerts as FuelAlert[] };
}
