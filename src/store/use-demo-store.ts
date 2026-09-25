"use client";

import { create } from "zustand";
import {
  AlertStatus,
  DriverStep,
  nextDriverStep,
} from "@/lib/workflows";

export type Role = "Propriétaire" | "Gérant" | "Superviseur" | "Chauffeur";
export type View =
  | "dashboard"
  | "trips"
  | "trip"
  | "stations"
  | "alerts"
  | "driver";

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

export type SessionUser = {
  name: string;
  email: string;
  role: Role;
  station?: string;
};

type DemoState = {
  user: SessionUser | null;
  role: Role;
  view: View;
  driverStep: DriverStep;
  alertStatus: AlertStatus;
  simulationActive: boolean;
  notification: string | null;
  trips: Trip[];
  stations: Station[];
  alerts: FuelAlert[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  navigate: (view: View) => void;
  createTrip: (trip: Omit<Trip, "id">) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  createStation: (station: Omit<Station, "id" | "color">) => void;
  updateStation: (id: string, station: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  createAlert: (alert: Omit<FuelAlert, "id" | "status">) => void;
  updateAlert: (id: string, alert: Partial<FuelAlert>) => void;
  deleteAlert: (id: string) => void;
  advanceDriver: () => void;
  simulateTheft: () => void;
  acknowledgeAlert: () => void;
  resetDemo: () => void;
  clearNotification: () => void;
};

const USERS: SessionUser[] = [
  { name: "Amakou-Amon", email: "proprietaire@sud.ci", role: "Propriétaire" },
  { name: "Awa Koné", email: "gerant@sud.ci", role: "Gérant", station: "Station Cocody" },
  { name: "Moussa Diarra", email: "superviseur@sud.ci", role: "Superviseur" },
  { name: "Yao Kouassi", email: "chauffeur@sud.ci", role: "Chauffeur" },
];

const INITIAL_TRIPS: Trip[] = [
  { id: "PF-2026-0925", status: "En route", route: "GESTOCI → Cocody", volume: 45000, delta: null, driver: "Yao Kouassi" },
  { id: "PF-2026-0924", status: "Clôturé", route: "GESTOCI → Marcory", volume: 36000, delta: -90, driver: "Adama Traoré" },
  { id: "PF-2026-0923", status: "Clôturé", route: "GESTOCI → Yopougon", volume: 42000, delta: 20, driver: "Yao Kouassi" },
  { id: "PF-2026-0922", status: "Clôturé", route: "GESTOCI → Cocody", volume: 45000, delta: -110, driver: "Adama Traoré" },
];

const INITIAL_STATIONS: Station[] = [
  { id: "ST-CY", name: "Station Cocody", stock: 32400, capacity: 50000, status: "Opérationnelle", color: "#FF7900" },
  { id: "ST-MY", name: "Station Marcory", stock: 28620, capacity: 40000, status: "Opérationnelle", color: "#2B62AC" },
  { id: "ST-YN", name: "Station Yopougon", stock: 25400, capacity: 36000, status: "Niveau bas", color: "#F59E0B" },
];

const INITIAL_ALERTS: FuelAlert[] = [
  { id: "ALT-001", severity: "Critique", title: "Baisse de 2 000 L hors zone autorisée", details: "CI 01 AB 4521 · Boulevard de Vridi · 09:41", status: "open" },
  { id: "ALT-002", severity: "Technique", title: "Batterie sonde C4 sous 20 %", details: "Camion CI 02 BB 7480 · il y a 2 h", status: "open" },
];

export const useDemoStore = create<DemoState>((set) => ({
  user: null,
  role: "Propriétaire",
  view: "dashboard",
  driverStep: "assigned",
  alertStatus: "open",
  simulationActive: false,
  notification: null,
  trips: INITIAL_TRIPS,
  stations: INITIAL_STATIONS,
  alerts: INITIAL_ALERTS,
  login: (email, password) => {
    const user = USERS.find((candidate) => candidate.email === email.trim().toLowerCase());
    if (!user || password !== "ProFuel#Demo2026!") return false;
    set({
      user,
      role: user.role,
      view: user.role === "Chauffeur" ? "driver" : "dashboard",
      notification: `Bienvenue ${user.name}`,
    });
    return true;
  },
  logout: () =>
    set({
      user: null,
      view: "dashboard",
      role: "Propriétaire",
      driverStep: "assigned",
      notification: null,
    }),
  navigate: (view) => set({ view }),
  createTrip: (trip) =>
    set((state) => ({
      trips: [{ ...trip, id: `PF-2026-${String(926 + state.trips.length).padStart(4, "0")}` }, ...state.trips],
      notification: "Voyage créé avec succès",
    })),
  updateTrip: (id, trip) =>
    set((state) => ({
      trips: state.trips.map((item) => item.id === id ? { ...item, ...trip } : item),
      notification: "Voyage modifié",
    })),
  deleteTrip: (id) =>
    set((state) => ({
      trips: state.trips.filter((item) => item.id !== id),
      notification: "Voyage supprimé",
    })),
  createStation: (station) =>
    set((state) => ({
      stations: [...state.stations, { ...station, id: `ST-${Date.now()}`, color: "#FF7900" }],
      notification: "Station créée",
    })),
  updateStation: (id, station) =>
    set((state) => ({
      stations: state.stations.map((item) => item.id === id ? { ...item, ...station } : item),
      notification: "Station modifiée",
    })),
  deleteStation: (id) =>
    set((state) => ({
      stations: state.stations.filter((item) => item.id !== id),
      notification: "Station supprimée",
    })),
  createAlert: (alert) =>
    set((state) => ({
      alerts: [{ ...alert, id: `ALT-${String(state.alerts.length + 1).padStart(3, "0")}`, status: "open" }, ...state.alerts],
      notification: "Alerte créée",
    })),
  updateAlert: (id, alert) =>
    set((state) => ({
      alerts: state.alerts.map((item) => item.id === id ? { ...item, ...alert } : item),
      notification: "Alerte modifiée",
    })),
  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((item) => item.id !== id),
      notification: "Alerte supprimée",
    })),
  advanceDriver: () =>
    set((state) => {
      const next = nextDriverStep(state.driverStep);
      return {
        driverStep: next,
        notification:
          next === "completed"
            ? "Voyage PF-2026-0925 clôturé"
            : "Étape enregistrée et synchronisée",
      };
    }),
  simulateTheft: () =>
    set((state) => ({
      simulationActive: true,
      alertStatus: "open",
      trips: state.trips.map((trip) => trip.id === "PF-2026-0925" ? { ...trip, delta: -2000 } : trip),
      notification: "Alerte critique : baisse de 2 000 L détectée",
    })),
  acknowledgeAlert: () =>
    set((state) => ({
      alertStatus: "acknowledged",
      alerts: state.alerts.map((alert) => alert.id === "ALT-001" ? { ...alert, status: "acknowledged" } : alert),
      notification: "Alerte prise en charge par Amakou-Amon",
    })),
  resetDemo: () =>
    set({
      driverStep: "assigned",
      alertStatus: "open",
      simulationActive: false,
      trips: INITIAL_TRIPS,
      stations: INITIAL_STATIONS,
      alerts: INITIAL_ALERTS,
      notification: "Démo réinitialisée",
    }),
  clearNotification: () => set({ notification: null }),
}));
