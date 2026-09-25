export type DriverStep =
  | "assigned"
  | "loading"
  | "in_transit"
  | "arrived"
  | "unloading"
  | "completed";

export type AlertStatus = "open" | "acknowledged";

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
