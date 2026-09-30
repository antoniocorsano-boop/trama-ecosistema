import AxeBuilder from "@axe-core/playwright";
import {expect,test} from "@playwright/test";

test("Operations exposes governed path, explicit defer and semantic timeline",async({page},testInfo)=>{
 const external:string[]=[];
 page.on("request",request=>{const url=new URL(request.url());if(url.hostname!=="127.0.0.1")external.push(request.url());});
 await page.goto("/#/operations");
 await expect(page.getByRole("heading",{name:"Percorso operativo e cronologia governata"})).toBeVisible();
 await expect(page.getByText(/TRAMA-SA-01/)).toBeVisible();
 const deferBlock=page.getByRole("heading",{name:"Defer espliciti"}).locator("..");
 await expect(deferBlock.getByText(/DOS-A1/)).toBeVisible();
 await expect(deferBlock.getByText(/DEFERRED/)).toBeVisible();
 const runtimePanel=page.getByTestId("runtime-observation");
 await expect(runtimePanel).toBeVisible();
 await expect(runtimePanel.getByText("READ_ONLY",{exact:true})).toBeVisible();
 await expect(runtimePanel.getByText("DEFERRED",{exact:true})).toBeVisible();
 await expect(runtimePanel.getByText(/contract-mock/)).toBeVisible();
 await expect(runtimePanel.getByText(/runtime.start/)).toBeVisible();
 await expect(runtimePanel.getByText(/unauthorized/)).toBeVisible();
 await page.getByRole("tab",{name:"Cronologia governata"}).click();
 await expect(page.getByText(/Copertura timeline: PARTIAL_EXPLICIT/)).toBeVisible();
 await expect(page.getByText("EVT-CC3-F1-HUMAN-PASS",{exact:true})).toBeVisible();
 const bodyWidth=await page.evaluate(()=>document.body.scrollWidth), viewport=await page.evaluate(()=>window.innerWidth);
 expect(bodyWidth).toBeLessThanOrEqual(viewport+1);
 expect(external).toEqual([]);
 const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
 expect(axe.violations).toEqual([]);
 await page.screenshot({path:testInfo.outputPath("operations-"+testInfo.project.name+".png"),fullPage:true});
});

test("Assurance shows target and gaps without score or implicit certification",async({page},testInfo)=>{
 const external:string[]=[];
 page.on("request",request=>{const url=new URL(request.url());if(url.hostname!=="127.0.0.1")external.push(request.url());});
 await page.goto("/#/assurance");
 await expect(page.getByRole("heading",{name:"Stakeholder Assurance"})).toBeVisible();
 await expect(page.getByText("ASSURE-CERT-001",{exact:true})).toBeVisible();
 await expect(page.getByText("FORMALLY CERTIFIED",{exact:true})).toBeVisible();
 await expect(page.getByText("0",{exact:true}).first()).toBeVisible();
 await expect(page.getByText(/nessuna certificazione implicita/i)).toBeVisible();
 await expect(page.getByText(/Nessun punteggio complessivo/i)).toBeVisible();
 await page.getByLabel("Dominio").selectOption("PRIVACY");
 await expect(page.getByText("ASSURE-PRIV-001",{exact:true})).toBeVisible();
 const bodyWidth=await page.evaluate(()=>document.body.scrollWidth), viewport=await page.evaluate(()=>window.innerWidth);
 expect(bodyWidth).toBeLessThanOrEqual(viewport+1);
 expect(external).toEqual([]);
 const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
 expect(axe.violations).toEqual([]);
 await page.screenshot({path:testInfo.outputPath("assurance-"+testInfo.project.name+".png"),fullPage:true});
});
