"use client";

import { create } from "zustand";
import {
  INITIAL_ALERTS,
  INITIAL_STATIONS,
  INITIAL_TRIPS,
  type FuelAlert,
  type FuelSnapshot,
  type Station,
  type Trip,
} from "@/lib/fuel-data";
import {
  type AlertStatus,
  type DriverStep,
  nextDriverStep,
} from "@/lib/workflows";

export type { FuelAlert, Station, Trip };

export type Role = "Propriétaire" | "Gérant" | "Superviseur" | "Chauffeur";
export type View =
  | "dashboard"
  | "trips"
  | "trip"
  | "stations"
  | "alerts"
  | "driver";

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
  hydrateFuel: (snapshot: FuelSnapshot, revision: number) => void;
};

let fuelRevision = 0;
let fuelPersister: ((snapshot: FuelSnapshot) => void) | null = null;

export function setFuelPersister(persister: ((snapshot: FuelSnapshot) => void) | null) {
  fuelPersister = persister;
}

export function currentFuelRevision() {
  return fuelRevision;
}

function commit(recipe: (state: DemoState) => Partial<DemoState>, persist: boolean) {
  return (state: DemoState) => {
    const partial = recipe(state);
    const next = { ...state, ...partial };
    if (persist) {
      fuelRevision += 1;
      fuelPersister?.({ trips: next.trips, stations: next.stations, alerts: next.alerts });
    }
    return partial;
  };
}

const USERS: SessionUser[] = [
  { name: "Amakou-Amon", email: "proprietaire@sud.ci", role: "Propriétaire" },
  { name: "Awa Koné", email: "gerant@sud.ci", role: "Gérant", station: "Station Cocody" },
  { name: "Moussa Diarra", email: "superviseur@sud.ci", role: "Superviseur" },
  { name: "Yao Kouassi", email: "chauffeur@sud.ci", role: "Chauffeur" },
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
    set(commit((state) => ({
      trips: [{ ...trip, id: `PF-2026-${String(926 + state.trips.length).padStart(4, "0")}` }, ...state.trips],
      notification: "Voyage créé avec succès",
    }), true)),
  updateTrip: (id, trip) =>
    set(commit((state) => ({
      trips: state.trips.map((item) => item.id === id ? { ...item, ...trip } : item),
      notification: "Voyage modifié",
    }), true)),
  deleteTrip: (id) =>
    set(commit((state) => ({
      trips: state.trips.filter((item) => item.id !== id),
      notification: "Voyage supprimé",
    }), true)),
  createStation: (station) =>
    set(commit((state) => ({
      stations: [...state.stations, { ...station, id: `ST-${Date.now()}`, color: "#FF7900" }],
      notification: "Station créée",
    }), true)),
  updateStation: (id, station) =>
    set(commit((state) => ({
      stations: state.stations.map((item) => item.id === id ? { ...item, ...station } : item),
      notification: "Station modifiée",
    }), true)),
  deleteStation: (id) =>
    set(commit((state) => ({
      stations: state.stations.filter((item) => item.id !== id),
      notification: "Station supprimée",
    }), true)),
  createAlert: (alert) =>
    set(commit((state) => ({
      alerts: [{ ...alert, id: `ALT-${String(state.alerts.length + 1).padStart(3, "0")}`, status: "open" }, ...state.alerts],
      notification: "Alerte créée",
    }), true)),
  updateAlert: (id, alert) =>
    set(commit((state) => ({
      alerts: state.alerts.map((item) => item.id === id ? { ...item, ...alert } : item),
      notification: "Alerte modifiée",
    }), true)),
  deleteAlert: (id) =>
    set(commit((state) => ({
      alerts: state.alerts.filter((item) => item.id !== id),
      notification: "Alerte supprimée",
    }), true)),
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
    set(commit((state) => ({
      simulationActive: true,
      alertStatus: "open",
      trips: state.trips.map((trip) => trip.id === "PF-2026-0925" ? { ...trip, delta: -2000 } : trip),
      notification: "Alerte critique : baisse de 2 000 L détectée",
    }), true)),
  acknowledgeAlert: () =>
    set(commit((state) => ({
      alertStatus: "acknowledged",
      alerts: state.alerts.map((alert) => alert.id === "ALT-001" ? { ...alert, status: "acknowledged" } : alert),
      notification: "Alerte prise en charge par Amakou-Amon",
    }), true)),
  resetDemo: () =>
    set(commit(() => ({
      driverStep: "assigned",
      alertStatus: "open",
      simulationActive: false,
      trips: INITIAL_TRIPS,
      stations: INITIAL_STATIONS,
      alerts: INITIAL_ALERTS,
      notification: "Démo réinitialisée",
    }), true)),
  clearNotification: () => set({ notification: null }),
  hydrateFuel: (snapshot, revision) =>
    set(() => {
      if (revision !== fuelRevision) return {};
      return {
        trips: snapshot.trips,
        stations: snapshot.stations,
        alerts: snapshot.alerts,
      };
    }),
}));
