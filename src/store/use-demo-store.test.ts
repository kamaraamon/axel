import { beforeEach, describe, expect, it } from "vitest";
import { useDemoStore } from "./use-demo-store";

describe("session et CRUD mocké", () => {
  beforeEach(() => {
    useDemoStore.getState().logout();
    useDemoStore.getState().resetDemo();
  });

  it("lie le compte au rôle et exige une déconnexion pour en changer", () => {
    expect(useDemoStore.getState().login("gerant@sud.ci", "ProFuel#Demo2026!")).toBe(true);
    expect(useDemoStore.getState().role).toBe("Gérant");
    expect(useDemoStore.getState().user?.name).toBe("Awa Koné");
    useDemoStore.getState().logout();
    expect(useDemoStore.getState().user).toBeNull();
    expect(useDemoStore.getState().login("chauffeur@sud.ci", "ProFuel#Demo2026!")).toBe(true);
    expect(useDemoStore.getState().view).toBe("driver");
  });

  it("refuse un mot de passe invalide", () => {
    expect(useDemoStore.getState().login("proprietaire@sud.ci", "incorrect")).toBe(false);
    expect(useDemoStore.getState().user).toBeNull();
  });

  it("crée, modifie et supprime chaque ressource", () => {
    const state = useDemoStore.getState();
    state.createTrip({ status: "Planifié", route: "GESTOCI → Test", volume: 10000, delta: null, driver: "Test" });
    const trip = useDemoStore.getState().trips[0];
    useDemoStore.getState().updateTrip(trip.id, { volume: 12000 });
    expect(useDemoStore.getState().trips[0].volume).toBe(12000);
    useDemoStore.getState().deleteTrip(trip.id);
    expect(useDemoStore.getState().trips.some((item) => item.id === trip.id)).toBe(false);

    state.createStation({ name: "Station Test", stock: 1000, capacity: 5000, status: "Opérationnelle" });
    const station = useDemoStore.getState().stations.at(-1)!;
    useDemoStore.getState().updateStation(station.id, { stock: 2000 });
    expect(useDemoStore.getState().stations.at(-1)?.stock).toBe(2000);
    useDemoStore.getState().deleteStation(station.id);
    expect(useDemoStore.getState().stations.some((item) => item.id === station.id)).toBe(false);

    state.createAlert({ severity: "Avertissement", title: "Test", details: "Détail" });
    const alert = useDemoStore.getState().alerts[0];
    useDemoStore.getState().updateAlert(alert.id, { title: "Modifiée" });
    expect(useDemoStore.getState().alerts[0].title).toBe("Modifiée");
    useDemoStore.getState().deleteAlert(alert.id);
    expect(useDemoStore.getState().alerts.some((item) => item.id === alert.id)).toBe(false);
  });
});
