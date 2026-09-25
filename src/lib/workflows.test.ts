import { describe, expect, it } from "vitest";
import {
  DRIVER_FLOW,
  formatLiters,
  nextDriverStep,
  reconcile,
} from "./workflows";

describe("workflow chauffeur", () => {
  it("parcourt les six étapes jusqu'à la clôture", () => {
    let step = DRIVER_FLOW[0];
    for (let index = 1; index < DRIVER_FLOW.length; index += 1) {
      step = nextDriverStep(step);
      expect(step).toBe(DRIVER_FLOW[index]);
    }
    expect(nextDriverStep(step)).toBe("completed");
  });
});

describe("rapprochement des volumes", () => {
  it("détecte la perte client de 2 000 L", () => {
    expect(reconcile(45000, 43000)).toEqual({
      delta: -2000,
      percentage: -4.44,
      isWithinTolerance: false,
    });
  });

  it("accepte un écart sous la tolérance de 0,5 %", () => {
    expect(reconcile(45000, 44800).isWithinTolerance).toBe(true);
  });

  it("formate les volumes en français", () => {
    expect(formatLiters(45000)).toContain("45");
    expect(formatLiters(45000).endsWith(" L")).toBe(true);
  });
});
