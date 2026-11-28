"use client";

import Image from "next/image";
import { EXPERIENCE_FORMS, suggestExperienceForms, type ExperienceForm } from "../lib/experience-forms";
import type { ExperienceGrammar } from "../lib/model";

const GALLERY_ORDER = ["INQUIRY_EVIDENCE","SIMULATION_MICROWORLD","ENVIRONMENTAL_STORYTELLING","VISUAL_NARRATIVE","WORKSHOP_CONSTRUCTION","BRANCHING_CONSEQUENCE"] as const;

export function ExperienceFormArtwork({form}:{form:ExperienceForm}) {
  return <Image className="experience-artwork" src={form.image} alt="" width={640} height={360} sizes="(max-width: 650px) 100vw, 360px" unoptimized/>;
}

export function ExperienceGallery({idea,grammar,onChange,mode="radio"}:{
  idea:string; grammar:ExperienceGrammar; onChange:(value:ExperienceGrammar)=>void; mode?:"radio"|"button";
}) {
  const suggestions=suggestExperienceForms(idea);
  const ordered=GALLERY_ORDER.map(id=>EXPERIENCE_FORMS.find(form=>form.id===id)!);
  function content(form:ExperienceForm) {
    const suggested=suggestions.find(candidate=>candidate.form.id===form.id);
    return <>
      <ExperienceFormArtwork form={form}/>
      <span className="experience-card-copy">
        <strong>{form.title}</strong>
        <span>{form.description}</span>
        {suggested&&<small className="intent-recommended">Suggerita · {suggested.matches.join(", ")}</small>}
        {suggested&&<small>{form.reason}</small>}
      </span>
    </>;
  }
  return <fieldset className="intent-forms illustrated-experiences">
    <legend>Forma dell’esperienza</legend>
    <p className="intent-hint">{suggestions.length?"I suggerimenti si basano sulle parole dell’idea. Tutte le forme restano disponibili.":"Scegli liberamente la forma che vuoi dare all’apprendimento."}</p>
    <div className="experience-gallery" aria-label="Tipi di esperienza">
      {ordered.map(form=>mode==="radio"?
        <label key={form.id} className={"intent-form-option experience-card"+(grammar===form.id?" active":"")}>
          <input type="radio" name="experience-form" value={form.id} checked={grammar===form.id} onChange={()=>onChange(form.id)}/>
          {content(form)}
        </label>:
        <button key={form.id} type="button" className={"experience-card"+(grammar===form.id?" active":"")} aria-pressed={grammar===form.id} onClick={()=>{if(grammar!==form.id)onChange(form.id)}}>
          {content(form)}
        </button>)}
    </div>
    {mode==="radio"?<label className="intent-form-option experience-defer">
      <input type="radio" name="experience-form" value="" checked={grammar===""} onChange={()=>onChange("")}/>
      <span><strong>Deciderò più avanti</strong><span>Inizia con una bozza senza scegliere una forma.</span></span>
    </label>:<button type="button" className="quiet-action experience-defer" aria-pressed={grammar===""} onClick={()=>{if(grammar!=="")onChange("")}}>Deciderò più avanti</button>}
    <p className="intent-hint experience-art-note">Le immagini sono esempi di esperienze originali Atlas; non rappresentano materiali già prodotti per questa bozza.</p>
  </fieldset>;
}
