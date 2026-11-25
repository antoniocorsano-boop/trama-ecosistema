"use client";
import { MATERIAL_PRESETS, DEFAULT_RECIPE, type SceneVisualRecipe } from "../lib/scene-visual-recipe";
export function SceneVisualRecipeEditor({value,saved,onChange,onSave,onRemove}:{
 value:SceneVisualRecipe;saved?:SceneVisualRecipe;
 onChange:(v:SceneVisualRecipe)=>void;onSave:()=>void;onRemove:()=>void;
}){
 const changed=JSON.stringify(value)!==JSON.stringify(saved??DEFAULT_RECIPE);
 return <fieldset className="world-composer-fieldset">
  <legend>Regia visiva della scena</legend>
  <p className="world-composer-note">Parametri di lavorazione, non contenuti autorizzati. La prova reale di materiale, luce e inquadratura è disponibile nella Sala Zero; regia animata e video restano richieste da collegare alla produzione.</p>
  <div className="world-grid">
   <label className="world-field"><strong>Superficie di riferimento</strong><select value={value.material} onChange={e=>onChange({...value,material:e.target.value as SceneVisualRecipe["material"]})}>
    {Object.entries(MATERIAL_PRESETS).map(([key,p])=><option key={key} value={key}>{p.label}</option>)}
   </select></label>
   <label className="world-field"><strong>Illuminazione</strong><select value={value.light} onChange={e=>onChange({...value,light:e.target.value as SceneVisualRecipe["light"]})}><option value="balanced">Equilibrata</option><option value="reference">Originale</option></select></label>
   <label className="world-field"><strong>Inquadratura · {value.orbit.toFixed(2)} rad</strong><input type="range" min={-.3} max={.3} step={.01} value={value.orbit} onChange={e=>onChange({...value,orbit:Number(e.target.value)})}/></label>
   <label className="world-field"><strong>Movimento previsto</strong><select value={value.motion} onChange={e=>onChange({...value,motion:e.target.value as SceneVisualRecipe["motion"]})}><option value="none">Nessuno</option><option value="reveal">Rivelazione della scena · da produrre</option></select></label>
   <label className="world-field"><strong>Video previsto</strong><select value={value.media} onChange={e=>onChange({...value,media:e.target.value as SceneVisualRecipe["media"]})}><option value="none">Nessuno</option><option value="local-video">Video locale · da collegare</option></select></label>
  </div>
  <div className="world-composer-buttons">
   <button type="button" className="primary-action" disabled={!!saved&&!changed} onClick={onSave}>Conserva regia nella scena</button>
   <button type="button" className="secondary-action" disabled={!changed} onClick={()=>onChange(saved??DEFAULT_RECIPE)}>Ripristina parametri salvati</button>
   <button type="button" className="quiet-action" disabled={!saved} onClick={onRemove}>Rimuovi regia di prova</button>
  </div>
  <p className="world-composer-note" role="status">{changed?"Modifiche da conservare.":saved?"Parametri conservati nella scena.":"Nessun profilo conservato."} La prova non modifica la narrazione né concede autorizzazioni.</p>
 </fieldset>;
}
