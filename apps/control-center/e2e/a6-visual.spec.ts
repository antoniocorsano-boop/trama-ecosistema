import { expect, test } from "@playwright/test";

const routes = [
  ["overview", "/#/"],
  ["maturity", "/#/maturity"],
  ["ecosystem", "/#/ecosystem"],
  ["evidence", "/#/evidence"],
  ["operations", "/#/operations"],
  ["assurance", "/#/assurance"],
] as const;

const overviewVisualKnowledge = {
  schemaVersion: "1.0.0",
  subject: "project-knowledge",
  asOf: "2026-09-28T19:30:00Z",
  status: "PARTIAL",
  facts: [],
  decisions: [],
  activeInvariants: [
    {
      eventId: "TRAMA-EVT-KB-SECOND-BRAIN-FOUNDATION",
      type: "DECISION",
      subject: "project-knowledge",
      statement: "Use TRAMA Project Knowledge Base and Context Packs as the primary operational memory; conversational memory is only a pointer, never technical authority.",
      status: "CURRENT",
    },
  ],
  evidence: [],
  exactHeads: [],
  blockingGates: [],
  dependencies: [],
  knownConflicts: [],
  knownRejectedApproaches: [],
  nextCandidateActions: [],
  sourceRefs: [],
};

for (const [name, route] of routes) {
  test(`visual parity: ${name}`, async ({ page }) => {
    if (name === "overview") {
      await page.route("**/data/context-packs/project-knowledge.json", async (request) => {
        await request.fulfill({ json: overviewVisualKnowledge });
      });
    }

    await page.goto(route);
    await expect(page.locator("#main-content")).toBeVisible();
    if (name === "operations") {
      await page.getByTestId("runtime-observation").evaluate((element) => {
        (element as HTMLElement).style.display = "none";
      });
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    });
  });
}
