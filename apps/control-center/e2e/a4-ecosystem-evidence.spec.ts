import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Ecosystem preserves governed relation semantics and accessible graph/list parity", async ({ page }, testInfo) => {
  const externalRequests:string[]=[];
  page.on("request",(request)=>{
    const url=new URL(request.url());
    if(url.hostname!=="127.0.0.1") externalRequests.push(request.url());
  });

  await page.goto("/#/ecosystem");

  await expect(page.getByRole("heading",{name:"Capability e relazioni governate"})).toBeVisible();
  await expect(page.getByLabel("Mappa grafica delle relazioni governate")).toBeVisible();
  const list=page.getByLabel("Elenco equivalente delle relazioni");
  await expect(list.getByRole("button",{name:/Docente OS → Atlas/i})).toBeVisible();
  await list.getByRole("button",{name:/Docente OS → Atlas/i}).click();

  const detail=page.getByLabel("Elenco equivalente delle relazioni").locator("..").locator("..").locator("aside");
  await expect(page.getByText("Futuro non autorizzato",{exact:true}).first()).toBeVisible();
  await expect(page.getByText("NOT AUTHORIZED",{exact:true}).first()).toBeVisible();
  await expect(page.getByText("DEFERRED",{exact:true}).first()).toBeVisible();

  const bodyWidth=await page.evaluate(()=>document.body.scrollWidth);
  const viewportWidth=await page.evaluate(()=>window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth+1);
  expect(externalRequests).toEqual([]);

  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);

  await page.screenshot({path:testInfo.outputPath(`ecosystem-${testInfo.project.name}.png`),fullPage:true});
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
