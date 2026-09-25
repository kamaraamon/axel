import { describe, expect, it } from "vitest";
import { INITIAL_TRIPS, parseFuelSnapshot } from "./fuel-data";

describe("parseFuelSnapshot", () => {
  it("accepts the seed trip shape", () => {
    const snapshot = parseFuelSnapshot({
      trips: INITIAL_TRIPS,
      stations: [],
      alerts: [],
    });
    expect(snapshot?.trips).toHaveLength(INITIAL_TRIPS.length);
  });

  it("rejects a trip without an id", () => {
    expect(parseFuelSnapshot({
      trips: [{ status: "Planifié", route: "A", volume: 1, delta: null, driver: "B" }],
      stations: [],
      alerts: [],
    })).toBeNull();
  });
});
