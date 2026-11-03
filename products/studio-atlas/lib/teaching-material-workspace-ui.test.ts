import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../components/TeachingMaterialWorkspace.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../components/TeachingMaterialWorkspace.module.css", import.meta.url), "utf8");

test("Studio Atlas keeps the material choice screen focused on the current decision", () => {
  assert.match(source, />Scegli i materiali</);
  assert.match(source, /Continua con \{selectedItems\.length\}/);
  assert.match(source, /Presentazione introduttiva/);
  assert.match(source, /Scheda di lavoro/);
  assert.match(source, /Guida illustrata/);
  assert.match(source, /Rubrica di valutazione/);

  assert.doesNotMatch(source, /Nessuna associazione viene salvata/);
  assert.doesNotMatch(source, /Lezione e salvataggio restano sotto il controllo/);
  assert.doesNotMatch(source, /PROSSIMO PASSO/);
});

test("Studio Atlas keeps one compact context and a reachable mobile primary action", () => {
  assert.match(source, /aria-label="Contesto didattico"/);
  assert.match(source, /context\.udaTitle/);
  assert.match(source, /context\.sectionLabel/);
  assert.match(source, /context\.discipline/);
  assert.match(styles, /position:sticky/);
  assert.match(styles, /min-height:4[4-9]px/);
});
