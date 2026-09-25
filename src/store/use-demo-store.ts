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

type DemoState = {
  role: Role;
  view: View;
  driverStep: DriverStep;
  alertStatus: AlertStatus;
  simulationActive: boolean;
  notification: string | null;
  setRole: (role: Role) => void;
  navigate: (view: View) => void;
  advanceDriver: () => void;
  simulateTheft: () => void;
  acknowledgeAlert: () => void;
  resetDemo: () => void;
  clearNotification: () => void;
};

export const useDemoStore = create<DemoState>((set) => ({
  role: "Propriétaire",
  view: "dashboard",
  driverStep: "assigned",
  alertStatus: "open",
  simulationActive: false,
  notification: null,
  setRole: (role) =>
    set({
      role,
      view: role === "Chauffeur" ? "driver" : "dashboard",
      notification: `Vue ${role} activée`,
    }),
  navigate: (view) => set({ view }),
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
    set({
      simulationActive: true,
      alertStatus: "open",
      notification: "Alerte critique : baisse de 2 000 L détectée",
    }),
  acknowledgeAlert: () =>
    set({
      alertStatus: "acknowledged",
      notification: "Alerte prise en charge par Amakou-Amon",
    }),
  resetDemo: () =>
    set({
      role: "Propriétaire",
      view: "dashboard",
      driverStep: "assigned",
      alertStatus: "open",
      simulationActive: false,
      notification: "Démo réinitialisée",
    }),
  clearNotification: () => set({ notification: null }),
}));
