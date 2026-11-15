import {test,expect} from "@playwright/test";
const studio="http://127.0.0.1:3100", atlas="http://127.0.0.1:3200";
test("professional action opens exact v0.2 interactive review via real bridge",async({page,context})=>{
 const writes:string[]=[];context.on("request",r=>{if(!["GET","HEAD"].includes(r.method()))writes.push(r.method())});
 await page.goto(studio);
 const action=page.getByRole("button",{name:"Vedi come studente — laboratorio"});
 await expect(action).toBeDisabled();
 await page.getByRole("checkbox",{name:/Apri soltanto per revisione professionale/}).check();
 const opened=page.waitForEvent("popup");await action.click();const review=await opened;
 await expect(review.getByRole("heading",{name:"Laboratorio dell’energia"})).toBeVisible({timeout:30000});
 await expect(page.getByText("Anteprima interattiva aperta. Nessuna pubblicazione.")).toBeVisible();
 expect(new URL(review.url()).origin).toBe(atlas);
 expect([...new URL(review.url()).searchParams.keys()]).toEqual(["channel"]);
 const btn=(name:string)=>review.getByRole("button",{name,exact:true});
 const next=btn("Continua");await expect(next).toBeDisabled();
 await expect(review.locator("#game[data-ready=true] canvas")).toBeVisible({timeout:30000});
 await btn("Prevedo A").click();for(const id of ["A","B","C"])await btn("Prova "+id).click();
 await btn("Scelgo C").click();await expect(next).toBeDisabled();
 await btn("Stessa luce, meno ingresso").click();await expect(next).toBeEnabled();
 await next.click();await expect(review.getByRole("heading",{name:"Trasferisci il ragionamento"})).toBeVisible();
 await expect(review.locator("#game canvas")).toHaveCount(0);
 expect(await review.evaluate(()=>localStorage.getItem("atlas:experience:studio-axf-axf-energy"))).toBeNull();
 expect(writes).toEqual([]);
});
test("altered original artwork prevents ACK and mounting",async({page,context})=>{
 await context.route(atlas+"/__axf-energy-review/assets/PE-02.webp",route=>route.fulfill({status:200,contentType:"image/webp",body:"altered"}));
 await page.goto(studio);await page.getByRole("checkbox",{name:/Apri soltanto per revisione professionale/}).check();
 const opened=page.waitForEvent("popup");await page.getByRole("button",{name:"Vedi come studente — laboratorio"}).click();const review=await opened;
 await expect(review.getByRole("heading",{name:"Anteprima non disponibile"})).toBeVisible({timeout:30000});
 await expect(review.locator("#game canvas")).toHaveCount(0);
 await expect(page.getByText("Anteprima non disponibile.",{exact:true})).toBeVisible({timeout:20000});
});
test("direct route without opener does not mount review",async({page})=>{
 await page.goto(atlas+"/percorsi/lab/studio-atlas-preview/?channel="+"a".repeat(48));
 await expect(page.getByRole("heading",{name:"Anteprima non disponibile"})).toBeVisible();
 await expect(page.locator("#game canvas")).toHaveCount(0);
});
