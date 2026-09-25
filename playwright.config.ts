import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    locale: "fr-FR",
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      slowMo: process.env.PW_DEMO ? 250 : 0,
      args: [
        "--incognito",
        "--lang=fr-FR",
        "--disable-extensions",
        "--disable-translate",
        "--disable-features=Translate,PasswordLeakDetection,PasswordManagerOnboarding",
        "--disable-save-password-bubble",
      ],
    },
  },
  reporter: [["list"]],
});
