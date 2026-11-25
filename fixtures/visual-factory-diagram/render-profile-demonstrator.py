"""Deterministic, local profile demonstrator; not a general SVG sanitizer."""
import argparse
import hashlib
import html
import json
import pathlib
import re
import xml.etree.ElementTree as ET

BASE = pathlib.Path(__file__).resolve().parent
NS = "http://www.w3.org/2000/svg"
PROFILES = ("trama", "atlas", "studio-atlas", "arena", "registro-docente")
PALETTE = {"canvas", "surface", "ink", "secondaryInk", "accent", "onAccent"}
VARIANTS = {"mobile-vertical": (360, 640), "desktop-lim-horizontal": (1280, 720)}

def need(condition, message):
    if not condition:
        raise ValueError(message)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def luminance(color):
    need(re.fullmatch(r"#[0-9a-fA-F]{6}", color), "invalid color")
    parts = [int(color[i:i+2], 16)/255 for i in (1, 3, 5)]
    linear = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in parts]
    return sum(x*y for x,y in zip(linear, (.2126,.7152,.0722)))

def contrast(a,b):
    l,h = sorted((luminance(a),luminance(b)))
    return (h+.05)/(l+.05)

def load_inputs():
    profiles_raw = (BASE/"profile-candidates.json").read_bytes()
    source_raw = (BASE/"profile-demonstrator-source.json").read_bytes()
    manifest = json.loads(profiles_raw)
    source = json.loads(source_raw)
    need(manifest["schema"]=="trama.diagram-profile-candidates/v0.1", "profile schema")
    need(source["schema"]=="trama.diagram-source/v0.1", "source schema")
    for item in (manifest,source):
        need(item["runtimeAuthorized"] is False and item["publicationAuthorized"] is False,"authority")
    need(tuple(p["id"] for p in manifest["profiles"])==PROFILES,"profile IDs")
    need([n["id"] for n in source["nodes"]]==["source","compose","review","archive"],"node sequence")
    need(source["edges"]==[["source","compose"],["compose","review"],["review","archive"]],"edge sequence")
    for text in [source["title"],source["description"],*(p["name"] for p in manifest["profiles"]),*(n[k] for n in source["nodes"] for k in ("label","detail"))]:
        need(isinstance(text,str) and 0<len(text)<=160 and not re.search(r"[\x00-\x1f<>]",text),"plain text")
    return manifest,source,sha(profiles_raw),sha(source_raw)

def render(profile, source, variant):
    w,h=VARIANTS[variant]
    p=profile["palette"]
    need(set(p)==PALETTE,"palette keys")
    for value in p.values():
        luminance(value)
    pairs=[("ink","canvas"),("ink","surface"),("secondaryInk","surface"),("onAccent","accent"),("accent","canvas"),("accent","surface")]
    checks=[]
    for fg,bg in pairs:
        ratio=contrast(p[fg],p[bg])
        limit=3 if fg=="accent" else 4.5
        need(ratio>=limit, f"{profile['id']} contrast {fg}/{bg}: {ratio:.3f}")
        checks.append({"foreground":fg,"background":bg,"ratio":round(ratio,3),"minimum":limit})
    # Studio Atlas muted-on-canvas is deliberately never rendered.
    esc=html.escape
    dark=p["ink"]
    accent=p["accent"]
    title=esc(source["title"])
    name=esc(profile["name"])
    parts=[f'<svg xmlns="{NS}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="diagram-title diagram-desc">',
      f'<title id="diagram-title">{title} — {name}</title>',
      f'<desc id="diagram-desc">{esc(source["description"])} Fonte verificata, composizione, revisione, conservazione.</desc>',
      f'<rect x="0" y="0" width="{w}" height="{h}" fill="{p["canvas"]}"/>',
      '<g font-family="system-ui, sans-serif" text-anchor="middle">']
    def label(x,y,value,size,fill,weight=400):
        parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}">{esc(value)}</text>')
    if variant=="mobile-vertical":
        label(180,37,profile["name"],21,dark,700)
        label(180,64,"Ciclo di produzione documentale",16,dark,600)
        boxes=[(24,86+132*i,312,100) for i in range(4)]
        font,small=20,16
    else:
        label(640,72,profile["name"],36,dark,700)
        label(640,119,source["title"],30,dark,600)
        boxes=[(42+310*i,244,266,180) for i in range(4)]
        font,small=27,19
    for i,(x,y,bw,bh) in enumerate(boxes):
        if i<3:
            if variant=="mobile-vertical":
                xx=x+bw//2; yy=y+bh
                d=f"M {xx} {yy} V {yy+30} M {xx-6} {yy+22} L {xx} {yy+30} L {xx+6} {yy+22}"
            else:
                xx=x+bw; yy=y+bh//2
                d=f"M {xx} {yy} H {xx+42} M {xx+34} {yy-7} L {xx+42} {yy} L {xx+34} {yy+7}"
            parts.append(f'<path d="{d}" fill="none" stroke="{accent}" stroke-width="3"/>')
        parts.append(f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" rx="12" fill="{p["surface"]}" stroke="{accent}" stroke-width="2"/>')
        cx=x+bw//2
        if variant=="mobile-vertical":
            parts.append(f'<rect x="{x+13}" y="{y+14}" width="36" height="29" rx="6" fill="{accent}"/>')
            label(x+31,y+34,str(i+1),17,p["onAccent"],700)
            label(cx,y+43,source["nodes"][i]["label"],font,dark,700)
            label(cx,y+74,source["nodes"][i]["detail"],small,p["secondaryInk"])
        else:
            parts.append(f'<rect x="{cx-23}" y="{y+16}" width="46" height="36" rx="7" fill="{accent}"/>')
            label(cx,y+42,str(i+1),22,p["onAccent"],700)
            label(cx,y+92,source["nodes"][i]["label"],font,dark,700)
            label(cx,y+132,source["nodes"][i]["detail"],small,p["secondaryInk"])
    label(w//2,h-16 if variant=="mobile-vertical" else h-56,"Campione P1 · non pubblicato",15 if variant=="mobile-vertical" else 22,dark)
    parts.append("</g></svg>")
    svg="\n".join(parts)
    wrapper='<!doctype html>\n<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+title+' — '+name+'</title><style>html,body{margin:0;padding:0;background:'+p["canvas"]+';color:'+dark+';font-family:system-ui,sans-serif}main{width:100%;max-width:'+str(w)+'px;margin:auto}svg{display:block;width:100%;height:auto}</style></head><body><main>\n'+svg+'\n</main></body></html>\n'
    return wrapper,svg,checks

def validate(svg, profile, variant):
    """Closed grammar for these generated demonstrators only."""
    need(len(svg.encode())<=50000 and not re.search(r"<!|<\?",svg),"declaration/size")
    root=ET.fromstring(svg)
    allowed={"svg":{"viewBox","role","aria-labelledby"},"title":{"id"},"desc":{"id"},
        "rect":{"x","y","width","height","rx","fill","stroke","stroke-width"},
        "g":{"font-family","text-anchor"},
        "path":{"d","fill","stroke","stroke-width"},
        "text":{"x","y","font-size","font-weight","fill"}}
    need(root.tag==f"{{{NS}}}svg","root")
    w,h=VARIANTS[variant]
    need(root.attrib=={"viewBox":f"0 0 {w} {h}","role":"img","aria-labelledby":"diagram-title diagram-desc"},"root attributes")
    palette=set(profile["palette"].values())|{"none"}
    for e in root.iter():
        need(e.tag.startswith(f"{{{NS}}}"),"namespace")
        tag=e.tag.split("}",1)[1]
        need(tag in allowed and set(e.attrib)<=allowed[tag],"element/attributes")
        for k,v in e.attrib.items():
            if k in ("fill","stroke"): need(v in palette,"paint")
            elif k=="d": need(re.fullmatch(r"[MLHV0-9 .-]+",v),"path")
            elif k=="font-family": need(v=="system-ui, sans-serif","font")
            elif k=="text-anchor": need(v=="middle","alignment")
            elif k=="id": need(v in ("diagram-title","diagram-desc"),"id")
            elif k not in ("viewBox","role","aria-labelledby"):
                need(re.fullmatch(r"[0-9]+",v),"numeric")
        need(not e.tail or not e.tail.strip(),"tail")
        if tag not in ("text","title","desc"): need(not e.text or not e.text.strip(),"text")
        else: need(len(e)==0,"text child")
    need(len(root.findall(f"{{{NS}}}title"))==len(root.findall(f"{{{NS}}}desc"))==1,"accessible metadata")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",type=pathlib.Path,required=True)
    args=ap.parse_args()
    manifest,source,profile_hash,source_hash=load_inputs()
    args.out.mkdir(parents=True,exist_ok=True)
    results=[]
    for p in manifest["profiles"]:
        for variant in VARIANTS:
            doc,svg,checks=render(p,source,variant)
            validate(svg,p,variant)
            stem=p["id"]+"-"+variant
            (args.out/(stem+".html")).write_text(doc,encoding="utf-8")
            (args.out/(stem+".svg")).write_text(svg,encoding="utf-8")
            results.append({"id":stem,"profile":p["id"],"variant":variant,"contrast":checks,
                "htmlSha256":sha(doc.encode()),"svgSha256":sha(svg.encode()),"staticGrammar":"PASS"})
    # Negative cases are never rendered. Assert independent rejection and positive control.
    p=manifest["profiles"][0]
    _,svg,_=render(p,source,"mobile-vertical")
    cases={
       "script":svg.replace("</svg>","<script>void 0</script></svg>"),
       "event":svg.replace("<svg ","<svg onload=\"void 0\" ",1),
       "external":svg.replace("</svg>","<image href=\"https://example.invalid/x\"/></svg>"),
       "foreignObject":svg.replace("</svg>","<foreignObject/></svg>"),
       "animation":svg.replace("</svg>","<animate/></svg>"),
       "remotePaint":svg.replace('fill="'+p["palette"]["canvas"]+'"','fill="url(https://example.invalid/x)"',1),
       "css":svg.replace("</svg>","<style>@import url(https://example.invalid/x);</style></svg>"),
       "doctype":"<!DOCTYPE svg>"+svg,
    }
    rejected={}
    for key,mutant in cases.items():
        need(mutant!=svg,"unchanged fixture")
        try: validate(mutant,p,"mobile-vertical")
        except (ValueError,ET.ParseError): rejected[key]="PASS"
        else: raise ValueError("accepted negative fixture: "+key)
    receipt={"schema":"trama.diagram-profile-receipt/v0.1","status":"GENERATED_NOT_REVIEWED",
       "sourceSha256":source_hash,"profilesSha256":profile_hash,"outputs":results,
       "rejections":rejected,"runtimeAuthorized":False,"publicationAuthorized":False}
    (args.out/"profile-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
    print(f"Generated {len(results)} static pairs; {len(rejected)} rejection cases PASS")

if __name__=="__main__":
    main()
