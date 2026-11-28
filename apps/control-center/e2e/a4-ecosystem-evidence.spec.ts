import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const governedSnapshot=JSON.parse(
  readFileSync(new URL("../../../control-center/data/ecosystem-snapshot.json",import.meta.url),"utf-8"),
);
const canonicalGraph=governedSnapshot.ecosystemGraph;
const canonicalNodes=new Map(canonicalGraph.nodes.map((item:any)=>[item.id,item]));
const canonicalFlows=new Map(canonicalGraph.flows.map((item:any)=>[item.id,item]));

test("Ecosystem v0.3 preserves canonical state, flow parity and GAP semantics", async ({ page }, testInfo) => {
  const externalRequests:string[]=[];
  page.on("request",(request)=>{
    const url=new URL(request.url());
    if(url.hostname!=="127.0.0.1") externalRequests.push(request.url());
  });

  await page.goto("/#/ecosystem");
  await expect(page.getByRole("heading",{name:"Capability e relazioni governate"})).toBeVisible();
  await expect(page.getByLabel("Mappa grafica delle relazioni governate")).toBeVisible();
  await expect(page.getByRole("button",{name:"Mappa governata"})).toHaveAttribute("aria-pressed","true");

  await expect(page.getByText(`${canonicalGraph.nodes.length} nodi`,{exact:true})).toBeVisible();
  await expect(page.getByText(`${canonicalGraph.flows.length} flussi`,{exact:true})).toBeVisible();

  const stateList=page.getByLabel("Elenco accessibile del grafo canonico");
  const canonicalFlowButtons=stateList.locator(".state-flow");
  await expect(canonicalFlowButtons).toHaveCount(canonicalGraph.flows.length);

  const accessNode=stateList.locator(".state-node").filter({hasText:"TRAMA Access"});
  await expect(accessNode).toContainText(String(canonicalNodes.get("trama_access").state));
  await expect(accessNode).toContainText(String(canonicalNodes.get("trama_access").nextAllowedIntervention.action));

  const accessDos=stateList.getByRole("button",{name:/TRAMA Access → Docente OS/i});
  await expect(accessDos).toBeVisible();
  await expect(accessDos).toContainText(String(canonicalFlows.get("trama_access_to_docente_os").state));

  const studioAuthoring=canonicalFlows.get("docente_os_to_studio_atlas");
  expect(studioAuthoring.nextAllowedIntervention.preconditions).not.toEqual([]);
  expect(studioAuthoring.nextAllowedIntervention.forbiddenUntil).not.toEqual([]);
  expect(
    `${studioAuthoring.nextAllowedIntervention.preconditions.join(" ")} ${studioAuthoring.nextAllowedIntervention.forbiddenUntil.join(" ")}`.toLowerCase(),
  ).toContain("contratto");

  await page.getByRole("button",{name:"AS IS → GAP → TO BE"}).click();
  await expect(page.getByRole("button",{name:"AS IS → GAP → TO BE"})).toHaveAttribute("aria-pressed","true");
  const gapView=page.getByLabel("Vista AS IS GAP TO BE");
  await expect(gapView).toContainText(String(canonicalNodes.get("trama_access").gap.summary));
  await expect(gapView).toContainText("TRAMA Access → Docente OS");
  await expect(gapView).toContainText(String(canonicalFlows.get("trama_access_to_docente_os").gap.summary));
  await expect(gapView).toContainText("Prerequisiti");
  await expect(gapView).toContainText(String(canonicalFlows.get("trama_access_to_docente_os").nextAllowedIntervention.preconditions[0]));
  await expect(gapView).toContainText("Bloccato fino a");
  await expect(gapView).toContainText("Docente OS → Studio Atlas");
  await expect(gapView).toContainText(String(studioAuthoring.nextAllowedIntervention.preconditions[0]));
  await expect(gapView).toContainText(String(studioAuthoring.nextAllowedIntervention.forbiddenUntil[0]));
  for (const nodeId of ["gateway","arena","curricolo_atlas","trama_governance"]) {
    await expect(gapView).toContainText(String(canonicalNodes.get(nodeId).gap.summary));
  }

  const bodyText=await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/\b\d+(?:[.,]\d+)?%\b/);
  expect(bodyText.toLowerCase()).not.toContain("score complessivo");

  const bodyWidth=await page.evaluate(()=>document.body.scrollWidth);
  const viewportWidth=await page.evaluate(()=>window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth+1);
  expect(externalRequests).toEqual([]);

  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({path:testInfo.outputPath(`ecosystem-v03-${testInfo.project.name}.png`),fullPage:true});
});

test("Evidence Explorer filters governed data and integrity has no overall score", async ({ page }, testInfo) => {
  const externalRequests:string[]=[];
  page.on("request",(request)=>{
    const url=new URL(request.url());
    if(url.hostname!=="127.0.0.1") externalRequests.push(request.url());
  });

  await page.goto("/#/evidence");
  await expect(page.getByRole("heading",{name:"Evidenze e integrità"})).toBeVisible();

  await page.getByLabel("Evidence type").selectOption("DOCUMENT_CANONICAL");
  await expect(page.getByText("EV-SOURCE-TRAMA-STATUS",{exact:true})).toBeVisible();

  await page.getByRole("tab",{name:"Integrità"}).click();
  await expect(page.getByText("Nessuno score complessivo.",{exact:false})).toBeVisible();
  await expect(page.getByText("INT-RUNTIME-AUTHORIZATION",{exact:true})).toBeVisible();

  const bodyWidth=await page.evaluate(()=>document.body.scrollWidth);
  const viewportWidth=await page.evaluate(()=>window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth+1);
  expect(externalRequests).toEqual([]);

  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({path:testInfo.outputPath(`evidence-${testInfo.project.name}.png`),fullPage:true});
});


test("Ecosystem edge labels retain at least 4.5:1 text/background contrast", async ({ page }) => {
  await page.goto("/#/ecosystem");
  const graph = page.getByLabel("Mappa grafica delle relazioni governate");
  await expect(graph).toBeVisible();
  await expect(graph.locator(".react-flow__edge-textwrapper").first()).toBeAttached();

  const labels = await graph.evaluate((root) => {
    const rgb = (value: string): number[] => {
      const channels = value.match(/[0-9]+(?:[.][0-9]+)?/g);
      if (!channels) throw new Error(`Cannot parse SVG fill: ${value}`);
      return channels.slice(0, 3).map(Number);
    };
    const luminance = (value: string): number => {
      const linear = rgb(value).map((channel) => {
        const s = channel / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    return [...root.querySelectorAll<SVGGElement>(".react-flow__edge-textwrapper")].map((group) => {
      const text = group.querySelector<SVGTextElement>(".react-flow__edge-text");
      const background = group.querySelector<SVGRectElement>(".react-flow__edge-textbg");
      if (!text || !background) throw new Error("Missing text or background for a canonical edge label");
      const textFill = getComputedStyle(text).fill;
      const backgroundFill = getComputedStyle(background).fill;
      const light = Math.max(luminance(textFill), luminance(backgroundFill));
      const dark = Math.min(luminance(textFill), luminance(backgroundFill));
      return { label: text.textContent?.trim(), textFill, backgroundFill, ratio: (light + 0.05) / (dark + 0.05) };
    });
  });
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(label.ratio, `${label.label}: ${label.textFill} on ${label.backgroundFill}`).toBeGreaterThanOrEqual(4.5);
  }
});
