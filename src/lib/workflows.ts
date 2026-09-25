export type DriverStep =
  | "assigned"
  | "loading"
  | "in_transit"
  | "arrived"
  | "unloading"
  | "completed";

export type AlertStatus = "open" | "acknowledged";
export type AccessRole = "Propriétaire" | "Gérant" | "Superviseur" | "Chauffeur";
export type Resource = "dashboard" | "trips" | "stations" | "alerts" | "driver";
export type Action = "read" | "create" | "update" | "delete";

const ACCESS: Record<AccessRole, Partial<Record<Resource, Action[]>>> = {
  Propriétaire: {
    dashboard: ["read"],
    trips: ["read", "create", "update", "delete"],
    stations: ["read", "create", "update", "delete"],
    alerts: ["read", "create", "update", "delete"],
  },
  Gérant: {
    dashboard: ["read"],
    trips: ["read", "create", "update"],
    stations: ["read", "update"],
    alerts: ["read", "create", "update"],
  },
  Superviseur: {
    dashboard: ["read"],
    trips: ["read", "create", "update"],
    stations: ["read"],
    alerts: ["read", "update"],
  },
  Chauffeur: {
    driver: ["read", "update"],
  },
};

export function can(role: AccessRole, resource: Resource, action: Action = "read") {
  return ACCESS[role][resource]?.includes(action) ?? false;
}

export const DRIVER_FLOW: DriverStep[] = [
  "assigned",
  "loading",
  "in_transit",
  "arrived",
  "unloading",
  "completed",
];

export const STEP_LABELS: Record<DriverStep, string> = {
  assigned: "Mission affectée",
  loading: "Chargement GESTOCI",
  in_transit: "En route",
  arrived: "Arrivée station",
  unloading: "Dépotage",
  completed: "Voyage clôturé",
};

export function nextDriverStep(step: DriverStep): DriverStep {
  const index = DRIVER_FLOW.indexOf(step);
  return DRIVER_FLOW[Math.min(index + 1, DRIVER_FLOW.length - 1)];
}

export function reconcile(declared: number, delivered: number) {
  const delta = delivered - declared;
  return {
    delta,
    percentage: Number(((delta / declared) * 100).toFixed(2)),
    isWithinTolerance: Math.abs(delta / declared) <= 0.005,
  };
}

export function formatLiters(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} L`;
}
