import { expect, test } from "@playwright/test";

const routes = [
  ["overview", "/#/"],
  ["maturity", "/#/maturity"],
  ["ecosystem", "/#/ecosystem"],
  ["evidence", "/#/evidence"],
  ["operations", "/#/operations"],
  ["assurance", "/#/assurance"],
] as const;

async function stabilizeEcosystemFullPageHeight(page: import("@playwright/test").Page, readyLabel = "Elenco accessibile del grafo canonico") {
  await expect(page.getByLabel(readyLabel)).toBeVisible();
  await page.evaluate(() => {
    const root=document.getElementById("root");
    const shell=document.querySelector<HTMLElement>(".app-shell");
    if(!root || !shell) throw new Error("Missing visual capture root");
    for (const element of [document.documentElement,document.body,root,shell]) {
      element.style.removeProperty("height");
      element.style.removeProperty("min-height");
      element.style.removeProperty("max-height");
      element.style.removeProperty("overflow");
    }
  });
  const stableHeight = await page.evaluate(async () => {
    await document.fonts.ready;
    const bottoms:number[]=[];
    for(let index=0;index<8;index+=1){
      await new Promise<void>((resolve)=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
      const shell=document.querySelector<HTMLElement>(".app-shell");
      if(!shell) throw new Error("Missing .app-shell for ecosystem visual capture");
      bottoms.push(shell.getBoundingClientRect().bottom + window.scrollY);
    }
    return Math.ceil(Math.max(...bottoms));
  });
  await page.evaluate((height) => {
    const root=document.getElementById("root");
    const shell=document.querySelector<HTMLElement>(".app-shell");
    if(!root || !shell) throw new Error("Missing visual capture root");
    for (const element of [document.documentElement,document.body,root,shell]) {
      element.style.height=`${height}px`;
      element.style.minHeight=`${height}px`;
      element.style.maxHeight=`${height}px`;
      element.style.overflow="hidden";
    }
  }, stableHeight);
  await expect.poll(
    () => page.evaluate(() => document.documentElement.scrollHeight),
    { message: "ecosystem full-page height must be deterministic before visual capture" },
  ).toBe(stableHeight);
}

async function expectCompactNonOverlappingNavigation(page: import("@playwright/test").Page) {
  const metrics=await page.evaluate(() => {
    const nav=document.querySelector<HTMLElement>(".primary-nav");
    const main=document.querySelector<HTMLElement>("#main-content");
    if(!nav || !main) throw new Error("Missing shell navigation or main content for reflow review");
    const navRect=nav.getBoundingClientRect();
    const mainRect=main.getBoundingClientRect();
    return {
      navHeight: navRect.height,
      navBottom: navRect.bottom,
      mainTop: mainRect.top,
    };
  });
  expect(metrics.navHeight).toBeLessThanOrEqual(128);
  expect(metrics.navBottom).toBeLessThanOrEqual(metrics.mainTop);
}

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
    if (name === "ecosystem") {
      await stabilizeEcosystemFullPageHeight(page);
    }
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    });
    if (name === "ecosystem") {
      await page.getByRole("button", { name: "AS IS → GAP → TO BE" }).click();
      await expect(page.getByLabel("Vista AS IS GAP TO BE")).toBeVisible();
      await stabilizeEcosystemFullPageHeight(page, "Vista AS IS GAP TO BE");
      await expect(page).toHaveScreenshot("ecosystem-gap.png", {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.005,
      });
    }
  });
}

test("reflow 320 keeps compact navigation outside main content in map and GAP views", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reflow-320", "Human-review regression is specific to the 320 px reflow breakpoint");
  await page.goto("/#/ecosystem");
  await expect(page.getByLabel("Elenco accessibile del grafo canonico")).toBeVisible();
  await expectCompactNonOverlappingNavigation(page);

  await page.getByRole("button", { name: "AS IS → GAP → TO BE" }).click();
  await expect(page.getByLabel("Vista AS IS GAP TO BE")).toBeVisible();
  await expectCompactNonOverlappingNavigation(page);
});
