import { test } from "node:test";
import assert from "node:assert/strict";
import { EXPERIENCE_FORMS, suggestExperienceForms } from "./experience-forms";

test("UX1 preserves six existing distinct grammar identifiers", () => {
  assert.equal(EXPERIENCE_FORMS.length, 6);
  assert.equal(new Set(EXPERIENCE_FORMS.map(form => form.id)).size, 6);
});

test("UX1 suggests inquiry for a malfunction and simulation for variables", () => {
  assert.equal(suggestExperienceForms("Indagine: indizi, cause, guasto di un sensore")[0].form.id, "INQUIRY_EVIDENCE");
  assert.equal(suggestExperienceForms("Simulazione dell’energia: variabili e parametri")[0].form.id, "SIMULATION_MICROWORLD");
});

test("UX1 normalizes accents, avoids substring matches and limits suggestions", () => {
  assert.equal(suggestExperienceForms("CITTÀ")[0].form.id, "ENVIRONMENTAL_STORYTELLING");
  assert.deepEqual(suggestExperienceForms("storicamente"), []);
  assert.deepEqual(suggestExperienceForms(""), []);
  assert.equal(suggestExperienceForms("indagine scelta costruire simulazione storia museo").length, 3);
});
