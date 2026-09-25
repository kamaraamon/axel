import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, account: string) {
  await page.getByRole("button", { name: account, exact: false }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Se déconnecter" }).first().click();
  await expect(page.getByRole("heading", { name: "Accéder au centre de contrôle" })).toBeVisible();
}

async function demoPause(page: Page) {
  if (process.env.PW_DEMO) await page.waitForTimeout(900);
}

test("connexion, CRUD propriétaire et isolation des quatre rôles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Propriétaire", exact: false }).click();

  // Mauvais mot de passe (couvert hors enregistrement pour éviter la bulle native Chrome).
  if (!process.env.PW_DEMO) {
    await page.getByLabel("Mot de passe").fill("incorrect");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Identifiants incorrects")).toBeVisible();
    await page.getByLabel("Mot de passe").fill("ProFuel#Demo2026!");
  }

  // Propriétaire : tous les CRUD.
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Propriétaire", { exact: true }).last()).toBeVisible();
  await expect(page.getByLabel("Changer de rôle")).toHaveCount(0);
  await demoPause(page);

  await page.getByRole("button", { name: "Voyages" }).click();
  const initialTrips = await page.locator("tbody tr").count();
  await page.getByRole("button", { name: "Planifier" }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByRole("button", { name: "Confirmer le voyage" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(initialTrips + 1);
  const createdTrip = page.locator("tbody tr").first();
  await createdTrip.getByRole("button", { name: /^Modifier/ }).click();
  await page.getByLabel("Volume du voyage").fill("46000");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(createdTrip.getByText(/46/)).toBeVisible();
  await createdTrip.getByRole("button", { name: /^Supprimer/ }).click();
  await expect(page.locator("tbody tr")).toHaveCount(initialTrips);

  await page.getByRole("button", { name: "Stations & stocks" }).click();
  await page.getByRole("button", { name: "Ajouter une station" }).click();
  await page.getByLabel("Nom de la station").fill("Station Bingerville");
  await page.getByLabel("Stock actuel").fill("12000");
  await page.getByLabel("Capacité").fill("30000");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  const station = page.locator(".station-card").filter({ hasText: "Station Bingerville" });
  await expect(station).toBeVisible();
  await station.getByRole("button", { name: "Modifier Station Bingerville" }).click();
  await page.getByLabel("Stock actuel").fill("15000");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(station.getByText(/15/).first()).toBeVisible();
  await station.getByRole("button", { name: "Supprimer Station Bingerville" }).click();
  await expect(station).toHaveCount(0);

  await page.getByRole("button", { name: "Centre d’alertes" }).click();
  await page.getByRole("button", { name: "Créer une alerte" }).click();
  await page.getByLabel("Titre de l'alerte").fill("Test pression cuve");
  await page.getByLabel("Détails de l'alerte").fill("Station Cocody · Cuve 2");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  let alert = page.locator(".alert-row").filter({ hasText: "Test pression cuve" });
  await expect(alert).toBeVisible();
  await alert.getByRole("button", { name: /^Modifier/ }).click();
  await page.getByLabel("Titre de l'alerte").fill("Pression cuve contrôlée");
  await page.getByLabel("Statut de l'alerte").selectOption("acknowledged");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  alert = page.locator(".alert-row").filter({ hasText: "Pression cuve contrôlée" });
  await expect(alert.getByText("Prise en charge")).toBeVisible();
  await alert.getByRole("button", { name: /^Supprimer/ }).click();
  await expect(alert).toHaveCount(0);
  await demoPause(page);
  await logout(page);

  // Gérant : lecture/création/modification, aucune suppression.
  await login(page, "Gérant");
  await page.getByRole("button", { name: "Voyages" }).click();
  await expect(page.getByRole("button", { name: /^Modifier/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Supprimer/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Stations & stocks" }).click();
  await expect(page.getByRole("button", { name: "Ajouter une station" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Modifier Station/ }).first()).toBeVisible();
  await demoPause(page);
  await logout(page);

  // Superviseur : opérations, station en lecture seule.
  await login(page, "Superviseur");
  await page.getByRole("button", { name: "Stations & stocks" }).click();
  await expect(page.getByRole("button", { name: "Ajouter une station" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Modifier Station/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Supprimer Station/ })).toHaveCount(0);
  await demoPause(page);
  await logout(page);

  // Chauffeur : aucune navigation administrative.
  await login(page, "Chauffeur");
  await expect(page.getByText("Votre mission du jour")).toBeVisible();
  await expect(page.getByText("Navigation")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Voyages" })).toHaveCount(0);
  await demoPause(page);
  await logout(page);
});

test("interactions du centre de commandement", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Propriétaire", exact: false }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.locator(".command-center")).toBeVisible();
  await expect(page.locator(".globe-stage canvas")).toBeVisible({ timeout: 15_000 });

  await page.locator(".station-rank button").filter({ hasText: "Marcory" }).click();
  await expect(page.locator(".globe-readout")).toContainText("Station Marcory");

  await page.getByRole("button", { name: "Changer de thème" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/command-theme-light/);
  await page.getByRole("button", { name: "Changer de thème" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/command-theme-dark/);

  await page.getByRole("button", { name: "Simuler une anomalie" }).click();
  await expect(page.getByText("Incident simulé · −2 000 L")).toBeVisible();
  await expect(page.getByText("02", { exact: true })).toBeVisible();
});
