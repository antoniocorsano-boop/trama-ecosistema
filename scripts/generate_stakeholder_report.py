#!/usr/bin/env python3
"""Generate the stakeholder assurance dossier from the governed ecosystem snapshot."""

from __future__ import annotations
import argparse, html, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DOMAIN_LABELS = {
    "PRIVACY": "Privacy e protezione dati",
    "NORMATIVE_GOVERNANCE": "Normativa e governance",
    "ACCESSIBILITY": "Accessibilità",
    "USABILITY": "Usabilità",
    "SECURITY": "Sicurezza",
    "OPERATIONAL_RELIABILITY": "Affidabilità operativa",
    "EXTERNAL_CERTIFICATION": "Certificazioni esterne",
}

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def esc(value):
    return html.escape(str(value or ""))

def render_html(snapshot: dict) -> str:
    claims = snapshot.get("assuranceClaims", [])
    generated = snapshot.get("generatedAt", "—")
    sections = []
    for claim in claims:
        r = claim.get("readiness", {})
        missing = r.get("missingEvidenceKinds", [])
        present = r.get("metEvidenceKinds", [])
        limitations = claim.get("limitations", [])
        sections.append(f"""
        <section class="claim">
          <div class="claim-head">
            <div><p class="domain">{esc(DOMAIN_LABELS.get(claim.get("domain"), claim.get("domain")))}</p><h2>{esc(claim.get("requirementId"))}</h2></div>
            <span class="status">{esc(claim.get("status"))} → {esc(claim.get("targetStatus"))}</span>
          </div>
          <p>{esc(claim.get("scope"))}</p>
          <div class="grid">
            <div><h3>Evidenze presenti</h3><ul>{''.join(f'<li>{esc(x)}</li>' for x in present) or '<li>Nessuna</li>'}</ul></div>
            <div><h3>Gap verso il target</h3><ul>{''.join(f'<li>{esc(x)}</li>' for x in missing) or '<li>Nessun gap evidenziale</li>'}</ul></div>
          </div>
          <p><strong>Readiness:</strong> {r.get("metPrerequisites",0)} prerequisiti su {r.get("requiredPrerequisites",0)} soddisfatti.</p>
          <p><strong>Autorità/review:</strong> {esc(claim.get("reviewAuthority") or "Non specificata")}</p>
          <p><strong>Standard/riferimento:</strong> {esc(claim.get("standardRef") or "Non specificato")}</p>
          <h3>Limiti</h3><ul>{''.join(f'<li>{esc(x)}</li>' for x in limitations) or '<li>Nessuno dichiarato</li>'}</ul>
        </section>""")
    return f"""<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRAMA — Dossier Stakeholder Assurance</title>
<style>
body{{font:15px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;max-width:960px;margin:0 auto;padding:32px;color:#17212b}}
header{{border-bottom:2px solid #213d52;padding-bottom:18px;margin-bottom:24px}}h1{{margin:0 0 6px}}.meta,.domain{{color:#526a7a}}
.claim{{break-inside:avoid;border:1px solid #c9d5de;border-radius:14px;padding:20px;margin:0 0 18px}}.claim-head{{display:flex;justify-content:space-between;gap:16px}}
.status{{border:1px solid #a4b8c7;border-radius:999px;padding:4px 10px;height:max-content;font-weight:700}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.notice{{background:#eef4f7;border-left:4px solid #315f7b;padding:12px 14px}}@media(max-width:680px){{body{{padding:18px}}.grid{{grid-template-columns:1fr}}.claim-head{{display:block}}}}
@media print{{body{{max-width:none;padding:0}}button{{display:none}}.claim{{border-color:#999}}}}
</style></head><body>
<header><h1>TRAMA — Dossier Stakeholder Assurance</h1><p class="meta">Generato automaticamente dallo stesso snapshot del Control Center: {esc(generated)}</p>
<p class="notice">Il dossier descrive evidenze e gap di readiness. Non costituisce certificazione, parere legale o dichiarazione generale di conformità.</p>
<button onclick="window.print()">Stampa / salva come PDF</button></header>
{''.join(sections)}
</body></html>"""

def render_markdown(snapshot: dict) -> str:
    out = [
        "# TRAMA — Dossier Stakeholder Assurance",
        "",
        f"Generato automaticamente dallo snapshot: **{snapshot.get('generatedAt','—')}**.",
        "",
        "> Questo dossier descrive evidenze e gap di readiness. Non costituisce certificazione, parere legale o dichiarazione generale di conformità.",
        "",
    ]
    for c in snapshot.get("assuranceClaims", []):
        r=c.get("readiness",{})
        out += [
            f"## {DOMAIN_LABELS.get(c.get('domain'),c.get('domain'))} — {c.get('requirementId')}",
            "",
            c.get("scope",""),
            "",
            f"- Stato attuale: **{c.get('status')}**",
            f"- Target: **{c.get('targetStatus')}**",
            f"- Readiness: **{r.get('metPrerequisites',0)}/{r.get('requiredPrerequisites',0)} prerequisiti**",
            f"- Evidenze presenti: {', '.join(r.get('metEvidenceKinds',[])) or 'nessuna'}",
            f"- Gap: {', '.join(r.get('missingEvidenceKinds',[])) or 'nessuno'}",
            f"- Autorità/review: {c.get('reviewAuthority') or 'non specificata'}",
            f"- Standard/riferimento: {c.get('standardRef') or 'non specificato'}",
            "",
            "### Limiti",
            *[f"- {x}" for x in c.get("limitations",[])],
            "",
        ]
    return "\n".join(out)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--snapshot",default="control-center/data/ecosystem-snapshot.json")
    p.add_argument("--html",default="control-center/reports/stakeholder-assurance.html")
    p.add_argument("--markdown",default="control-center/reports/stakeholder-assurance.md")
    args=p.parse_args()
    snap=load(ROOT/args.snapshot)
    hp=ROOT/args.html; mp=ROOT/args.markdown
    hp.parent.mkdir(parents=True,exist_ok=True)
    hp.write_text(render_html(snap),encoding="utf-8")
    mp.write_text(render_markdown(snap),encoding="utf-8")
    print("TRAMA_STAKEHOLDER_REPORT_PASS")

if __name__=="__main__":
    main()
