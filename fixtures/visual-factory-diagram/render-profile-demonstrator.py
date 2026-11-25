"""Deterministic, local profile demonstrator; not a general SVG sanitizer."""
import argparse
import hashlib
import html
import json
import pathlib
import re
import sys
import textwrap
import xml.etree.ElementTree as ET

BASE = pathlib.Path(__file__).resolve().parent
NS = "http://www.w3.org/2000/svg"
XML_LANG = "{http://www.w3.org/XML/1998/namespace}lang"
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

def render(profile, source, variant, *, footer="Campione P1 · non pubblicato", include_details=False, authored=False):
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
    description=source["description"]+" Fasi: "+"; ".join(n["label"]+(": "+n["detail"] if include_details else "") for n in source["nodes"])+"."
    if authored:
        numbers={node["id"]: i+1 for i,node in enumerate(source["nodes"])}
        relations=" · ".join(f"{numbers[a]} → {numbers[b]}" for a,b in source["edges"])
        description += " Relazioni: "+(relations or "nessuna")+"."
    parts=[f'<svg xmlns="{NS}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="diagram-title" aria-describedby="diagram-desc" xml:lang="it">',
      f'<title id="diagram-title">{title} — {name}</title>',
      f'<desc id="diagram-desc">{esc(description)}</desc>',
      f'<rect x="0" y="0" width="{w}" height="{h}" fill="{p["canvas"]}"/>',
      '<g font-family="system-ui, sans-serif" text-anchor="middle">']
    def label(x,y,value,size,fill,weight=400):
        parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}">{esc(value)}</text>')
    if variant=="mobile-vertical":
        label(180,37,profile["name"],21,dark,700)
        label(180,64,source["title"],13 if authored else 16,dark,600)
        boxes=[(24,86+(120 if authored else 132)*i,312,100) for i in range(len(source["nodes"]))]
        font,small=(16,14) if authored else (20,16)
    else:
        label(640,72,profile["name"],36,dark,700)
        label(640,119,source["title"],30,dark,600)
        boxes=[(42+310*i,244,266,180) for i in range(len(source["nodes"]))]
        font,small=(16,18) if authored else (27,19)
    if authored and variant=="desktop-lim-horizontal":
        boxes=[(x+(4-len(boxes))*155,y,bw,bh) for x,y,bw,bh in boxes]
    for i,(x,y,bw,bh) in enumerate(boxes):
        if not authored and i<3:
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
            label(cx,y+(61 if authored else 43),source["nodes"][i]["label"],font,dark,700)
            label(cx,y+(83 if authored else 74),source["nodes"][i]["detail"],small,p["secondaryInk"])
        else:
            parts.append(f'<rect x="{cx-23}" y="{y+16}" width="46" height="36" rx="7" fill="{accent}"/>')
            label(cx,y+42,str(i+1),22,p["onAccent"],700)
            label(cx,y+92,source["nodes"][i]["label"],font,dark,700)
            detail=source["nodes"][i]["detail"]
            lines=textwrap.wrap(detail,width=14) if authored else [detail]
            for row,line in enumerate(lines):
                label(cx,y+122+row*22 if authored else y+132,line,small,p["secondaryInk"])
    if authored:
        for index,(start,end) in enumerate(source["edges"]):
            ax,ay,aw,_=boxes[numbers[start]-1]
            bx,by,bw,_=boxes[numbers[end]-1]
            if variant=="mobile-vertical":
                y1=ay+24+index*7
                y2=by+24+index*7
                x=344+index*2
                end_x=bx+bw
                d=f"M {ax+aw} {y1} H {x} V {y2} H {end_x} M {end_x+5} {y2-4} L {end_x} {y2} L {end_x+5} {y2+4}"
            else:
                x1=ax+aw//2-28+index*8
                x2=bx+bw//2-28+index*8
                y=ay-18-index*9
                d=f"M {x1} {ay} V {y} H {x2} V {by} M {x2-5} {by-7} L {x2} {by} L {x2+5} {by-7}"
            parts.append(f'<path d="{d}" fill="none" stroke="{accent}" stroke-width="2"/>')
        pairs=relations.split(" · ") if relations else []
        for row in range(2):
            line=" · ".join(pairs[row*4:row*4+4])
            if line or row==0:
                label(w//2,575+row*20 if variant=="mobile-vertical" else 498+row*28,
                    ("Relazioni: " if row==0 else "")+(line or "nessuna"),14 if variant=="mobile-vertical" else 20,dark)
    label(w//2,h-16 if variant=="mobile-vertical" else h-56,footer,15 if variant=="mobile-vertical" else 22,dark)
    parts.append("</g></svg>")
    svg="\n".join(parts)
    wrapper='<!doctype html>\n<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+title+' — '+name+'</title><style>html,body{margin:0;padding:0;background:'+p["canvas"]+';color:'+dark+';font-family:system-ui,sans-serif}main{width:100%;max-width:'+str(w)+'px;margin:auto}svg{display:block;width:100%;height:auto}</style></head><body><main>\n'+svg+'\n</main></body></html>\n'
    if authored:
        policy="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
        wrapper=wrapper.replace("<head>",f'<head><meta http-equiv="Content-Security-Policy" content="{policy}">',1)
    return wrapper,svg,checks

def validate(svg, profile, variant, *, view_size=None):
    """Closed grammar for these generated demonstrators only."""
    need(len(svg.encode())<=50000 and not re.search(r"<!|<\?",svg),"declaration/size")
    root=ET.fromstring(svg)
    allowed={"svg":{"viewBox","role","aria-labelledby","aria-describedby",XML_LANG},"title":{"id"},"desc":{"id"},
        "rect":{"x","y","width","height","rx","fill","stroke","stroke-width"},
        "g":{"font-family","text-anchor"},
        "path":{"d","fill","stroke","stroke-width"},
        "text":{"x","y","font-size","font-weight","fill"}}
    need(root.tag==f"{{{NS}}}svg","root")
    w,h=VARIANTS[variant] if view_size is None else view_size
    need((w,h) in {(360,640),(1280,720),(360,960)},"dimensioni autorizzate")
    need(root.attrib=={"viewBox":f"0 0 {w} {h}","role":"img","aria-labelledby":"diagram-title","aria-describedby":"diagram-desc",XML_LANG:"it"},"root attributes")
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
            elif k not in ("viewBox","role","aria-labelledby","aria-describedby",XML_LANG):
                need(re.fullmatch(r"[0-9]+",v),"numeric")
        need(not e.tail or not e.tail.strip(),"tail")
        if tag not in ("text","title","desc"): need(not e.text or not e.text.strip(),"text")
        else: need(len(e)==0,"text child")
    titles=root.findall(f"{{{NS}}}title")
    descriptions=root.findall(f"{{{NS}}}desc")
    need(len(titles)==len(descriptions)==1,"accessible metadata")
    ids=[e.attrib["id"] for e in root.iter() if "id" in e.attrib]
    need(sorted(ids)==["diagram-desc","diagram-title"],"unique accessible IDs")
    need(titles[0].get("id")=="diagram-title" and descriptions[0].get("id")=="diagram-desc","accessible references")


P2_SIZES={"mobile-vertical":(360,960),"desktop-lim-horizontal":(1280,720)}
P2_IDS=("trama-ecosystem","studio-atlas-production","registro-qualification")
P2_STATES={
    "ARCHITECTURAL_DECISION":"DECISIONE",
    "APPROVED_DECISION_RULE":"DECISIONE",
    "APPROVED_PRODUCT_DIRECTION":"INDIRIZZO",
    "PROPOSED_CONTRACT":"PROPOSTA",
    "IMPLEMENTED_STRUCTURE":"CODICE",
    "IMPLEMENTED_CONTRACT":"CODICE",
    "QUALIFIED_EXACT_CANDIDATE":"VERIFICATO",
    "REVIEWED_NOT_RELEASED":"VERIFICATO",
}
P2_RELATIONS={"direction","sequence","contains","separate","parallel","review"}

def p2_text(value, max_len=80):
    need(isinstance(value,str) and 0<len(value)<=max_len and not re.search(r"[\x00-\x1f<>]",value),"testo P2 non ammesso")
    return value

def p2_validate_source(register,compositions):
    need(register["schema"]=="trama.diagram-source-register/v0.1","schema registro P2")
    need(compositions["schema"]=="trama.diagram-compositions/v0.1","schema composizioni P2")
    need(compositions["register"]=="p2-source-register.json","riferimento registro P2")
    for obj in (register,compositions):
        need(obj["publicationAuthorized"] is False and obj["runtimeAuthorized"] is False,"autorità P2")
        need(tuple(d["id"] for d in obj["diagrams"])==P2_IDS,"identità documenti P2")
    for record,design in zip(register["diagrams"],compositions["diagrams"]):
        need(record["id"]==design["id"],"identità fonte/composizione")
        need(len(design["titleLines"])==2 and len(design["panels"])==6,"composizione chiusa a sei pannelli")
        for line in design["titleLines"]: p2_text(line,48)
        for panel in design["panels"]:
            need(set(panel)=={"heading","state","fact","steps","note","relation"},"campi pannello P2")
            need(type(panel["fact"]) is int and 0<=panel["fact"]<len(record["facts"]),"riferimento fatto")
            fact=record["facts"][panel["fact"]]
            need(fact["source"] in record["sources"],"fonte fatto")
            need(P2_STATES[fact["state"]]==panel["state"],"stato del fatto alterato")
            need(panel["relation"] in P2_RELATIONS,"tipo di relazione")
            p2_text(panel["heading"],44)
            need(1<=len(panel["steps"])<=3,"numero nodi")
            need(1<=len(panel["note"])<=2,"numero note")
            for step in panel["steps"]:
                need(1<=len(step)<=2,"numero righe nodo")
                for line in step: p2_text(line,24)
            for line in panel["note"]: p2_text(line,58)
        # A review receipt and a product candidate may share a SHA but not a PR identity.
        if record["id"]=="registro-qualification":
            review=record["sources"]["review"]
            candidate=record["sources"]["candidate"]
            panels=[p for p in design["panels"] if p["relation"]=="review"]
            need(len(panels)==1,"unico pannello riesame Registro")
            panel=panels[0]
            need(record["facts"][panel["fact"]]["source"]=="review","fonte ricevuta Codex")
            need(review["commit"]==candidate["head"] and review["result"]=="CODE_REVIEW_NO_FINDINGS","ricevuta sul candidato esatto")
            need(candidate["draft"] is True and candidate["merged"] is False,"stato candidato Registro")
            need(panel["steps"]==[["Codex"],[f"PR #{review['number']}"]],"attribuzione PR riesaminata")
            need(panel["note"]==[f"Nessun rilievo sul commit {review['commit'][:7]}",f"PR #{candidate['number']} in bozza, non integrata"],"stato PR candidata distinto")

def p2_render(profile,record,design,variant):
    w,h=P2_SIZES[variant]
    p=profile["palette"]
    need(set(p)==PALETTE,"palette P2")
    for value in p.values(): luminance(value)
    # Pairings preserve P1 including the Studio Atlas restriction.
    checks=[]
    for fg,bg,limit in (("ink","canvas",4.5),("ink","surface",4.5),("secondaryInk","surface",4.5),("onAccent","accent",4.5),("accent","canvas",3),("accent","surface",3)):
        ratio=contrast(p[fg],p[bg])
        need(ratio>=limit,"contrasto P2")
        checks.append({"foreground":fg,"background":bg,"ratio":round(ratio,3),"minimum":limit})
    e=html.escape
    title=record["title"]
    desc="; ".join(f"Pannello {i+1}, {panel['state']}: {panel['heading']}. "+(" → " if panel["relation"] in ("direction","sequence") else " / ").join(" ".join(s) for s in panel["steps"])+". "+" ".join(panel["note"])+f". Fonte F{panel['fact']+1}." for i,panel in enumerate(design["panels"]))
    desc+=". Riferimenti e vincoli nel registro delle fonti P2. Candidato non pubblicato."
    parts=[f'<svg xmlns="{NS}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="diagram-title" aria-describedby="diagram-desc" xml:lang="it">',
        f'<title id="diagram-title">{e(title)}</title>',f'<desc id="diagram-desc">{e(desc)}</desc>',
        f'<rect x="0" y="0" width="{w}" height="{h}" fill="{p["canvas"]}"/>',
        '<g font-family="system-ui, sans-serif" text-anchor="middle">']
    labels=[]
    def text(x,y,value,size,color,weight=400):
        labels.append(value)
        parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{color}">{e(value)}</text>')
    def rect(x,y,bw,bh,fill,stroke=None,radius=8):
        border=f' stroke="{stroke}" stroke-width="2"' if stroke else ""
        parts.append(f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" rx="{radius}" fill="{fill}"{border}/>')
    def arrow(x1,x2,y):
        parts.append(f'<path d="M {x1} {y} H {x2} M {x2-5} {y-4} L {x2} {y} L {x2-5} {y+4}" fill="none" stroke="{p["accent"]}" stroke-width="2"/>')
    mobile=variant=="mobile-vertical"
    text(w//2,34 if mobile else 38,design["titleLines"][0],23 if mobile else 32,p["ink"],700)
    text(w//2,62 if mobile else 70,design["titleLines"][1],16 if mobile else 23,p["ink"],600)
    for i,panel in enumerate(design["panels"]):
        x,y,bw,bh=(12,84+140*i,336,132) if mobile else (24+626*(i%2),92+196*(i//2),606,180)
        cx=x+bw//2
        rect(x,y,bw,bh,p["surface"],p["accent"],10)
        text(cx,y+(20 if mobile else 28),panel["heading"],16 if mobile else 23,p["ink"],700)
        text(cx,y+(39 if mobile else 53),f"{panel['state']} · F{panel['fact']+1}",14 if mobile else 18,p["secondaryInk"],600)
        n=len(panel["steps"])
        gap=20 if mobile else 34
        inner=bw-(24 if mobile else 48)
        nodew=(inner-gap*(n-1))//n
        start=x+(bw-(nodew*n+gap*(n-1)))//2
        ny=y+(47 if mobile else 64)
        nh=46 if mobile else 62
        for j,step in enumerate(panel["steps"]):
            nx=start+j*(nodew+gap)
            rect(nx,ny,nodew,nh,p["surface"],p["accent"],6)
            for k,line in enumerate(step):
                baseline=ny+(28 if mobile else 38) if len(step)==1 else ny+(19+17*k if mobile else 25+24*k)
                text(nx+nodew//2,baseline,line,14 if mobile else 20,p["ink"],600)
            if j<n-1:
                mid=ny+nh//2
                if panel["relation"] in ("direction","sequence"):
                    arrow(nx+nodew+2,nx+nodew+gap-3,mid)
                else:
                    # A neutral separator avoids inventing direction for parallel or distinct concepts.
                    text(nx+nodew+gap//2,mid+(4 if mobile else 6),"·",16 if mobile else 22,p["ink"],700)
        for k,line in enumerate(panel["note"]):
            text(cx,y+(108+16*k if mobile else 150+22*k),line,14 if mobile else 18,p["secondaryInk"])
    text(w//2,h-(16 if mobile else 19),"Fonti nel registro P2 · candidato non pubblicato",14 if mobile else 18,p["ink"])
    parts.append("</g></svg>")
    svg="\n".join(parts)
    wrapper='<!doctype html>\n<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+e(title)+'</title><style>html,body{margin:0;padding:0;background:'+p["canvas"]+';color:'+p["ink"]+';font-family:system-ui,sans-serif}main{width:100%;max-width:'+str(w)+'px;margin:auto}svg{display:block;width:100%;height:auto}</style></head><body><main>\n'+svg+'\n</main></body></html>\n'
    validate(svg,profile,variant,view_size=(w,h))
    return wrapper,svg,checks,labels,desc

def generate_p2(out):
    manifest,_,profile_hash,_=load_inputs()
    register_raw=(BASE/"p2-source-register.json").read_bytes()
    compositions_raw=(BASE/"p2-compositions.json").read_bytes()
    register,compositions=json.loads(register_raw),json.loads(compositions_raw)
    p2_validate_source(register,compositions)
    profiles={p["id"]:p for p in manifest["profiles"]}
    out.mkdir(parents=True,exist_ok=True)
    results=[]
    for record,design in zip(register["diagrams"],compositions["diagrams"]):
        profile=profiles[record["profile"]]
        for variant in P2_SIZES:
            doc,svg,checks,labels,desc=p2_render(profile,record,design,variant)
            stem=record["id"]+"-"+variant
            data={"html":doc.encode("utf-8"),"svg":svg.encode("utf-8")}
            for ext,content in data.items(): (out/(stem+"."+ext)).write_bytes(content)
            results.append({"id":stem,"diagram":record["id"],"profile":record["profile"],"variant":variant,
                "viewBox":list(P2_SIZES[variant]),"title":record["title"],"description":desc,"labels":labels,
                "contrast":checks,"htmlSha256":sha(data["html"]),"svgSha256":sha(data["svg"]),"staticGrammar":"PASS"})
    # Causal rejection of invented statuses, missing provenance and excessive layout bounds.
    tests={}
    for key in ("status","fact","relation","authority","review_attribution"):
        mutant=json.loads(json.dumps(compositions))
        p=mutant["diagrams"][0]["panels"][0]
        if key=="status": p["state"]="VERIFICATO"
        elif key=="fact": p["fact"]=99
        elif key=="relation": p["relation"]="unknown"
        elif key=="authority": mutant["publicationAuthorized"]=True
        else:
            record=register["diagrams"][2]
            review_panel=next(p for p in mutant["diagrams"][2]["panels"] if p["relation"]=="review")
            review_panel["steps"][1]=[f"PR #{record['sources']['candidate']['number']}"]
        try: p2_validate_source(register,mutant)
        except (ValueError,KeyError,TypeError): tests[key]="PASS"
        else: raise ValueError("mutazione P2 accettata: "+key)
    receipt={"schema":"trama.diagram-p2-receipt/v0.1","status":"GENERATED_NOT_REVIEWED",
        "registerSha256":sha(register_raw),"compositionsSha256":sha(compositions_raw),"profilesSha256":profile_hash,
        "outputs":results,"semanticRejections":tests,"runtimeAuthorized":False,"publicationAuthorized":False}
    (out/"p2-receipt.json").write_bytes((json.dumps(receipt,ensure_ascii=False,indent=2)+"\n").encode("utf-8"))
    print(f"P2: {len(results)} coppie statiche; {len(tests)} rifiuti semantici PASS")

def generate_education(out):
    # One explicit educational pilot, not arbitrary source ingestion or a new renderer.
    manifest,_,profile_hash,_=load_inputs()
    raw=(BASE/"education-pilot-source.json").read_bytes()
    source=json.loads(raw)
    need(source["schema"]=="trama.diagram-education-pilot/v0.1" and source["id"]=="eco02-p1-filiera-orticola","identità pilota")
    need(source["status"]=="TEACHER_REVIEW_REQUIRED" and source["runtimeAuthorized"] is False and source["publicationAuthorized"] is False,"autorità didattica")
    need(source["context"]["curricoloClaim"]=="none" and source["context"]["curricoloAuthority"]=="Arena","autorità curricolare")
    need(source["profile"]=="studio-atlas","profilo pilota")
    need([n["id"] for n in source["nodes"]]==["source","compose","review","archive"],"sequenza pilota")
    need(source["edges"]==[["source","compose"],["compose","review"],["review","archive"]],"relazioni pilota")
    p2_text(source["title"],32)
    p2_text(source["description"],160)
    for n in source["nodes"]:
        p2_text(n["label"],18)
        p2_text(n["detail"],24)
    profile=next(p for p in manifest["profiles"] if p["id"]==source["profile"])
    out.mkdir(parents=True,exist_ok=True)
    outputs=[]
    for variant in VARIANTS:
        doc,svg,checks=render(profile,source,variant,footer="Tecnologia · proposta didattica",include_details=True)
        validate(svg,profile,variant)
        root=ET.fromstring(svg)
        labels=[e.text for e in root.iter(f"{{{NS}}}text")]
        desc=root.find(f"{{{NS}}}desc").text
        for n in source["nodes"]:
            need(n["label"] in labels and n["detail"] in labels and n["label"]+": "+n["detail"] in desc,"propagazione contenuto didattico")
        stem=source["id"]+"-"+variant
        data={"html":doc.encode("utf-8"),"svg":svg.encode("utf-8")}
        for ext,content in data.items(): (out/(stem+"."+ext)).write_bytes(content)
        outputs.append({"id":stem,"diagram":source["id"],"variant":variant,"viewBox":list(VARIANTS[variant]),
            "title":root.find(f"{{{NS}}}title").text,"description":desc,"labels":labels,
            "contrast":checks,"htmlSha256":sha(data["html"]),"svgSha256":sha(data["svg"])})
    guide=(BASE/"education-pilot-guide.md").read_bytes()
    (out/"guida-docente.md").write_bytes(guide)
    receipt={"schema":"trama.diagram-education-receipt/v0.1","status":"GENERATED_TEACHER_REVIEW_REQUIRED",
        "sourceSha256":sha(raw),"profilesSha256":profile_hash,"guideSha256":sha(guide),
        "runtimeAuthorized":False,"publicationAuthorized":False,"outputs":outputs}
    (out/"education-receipt.json").write_bytes((json.dumps(receipt,ensure_ascii=False,indent=2)+"\n").encode("utf-8"))
    print("Education pilot: 2 static pairs; teacher decision pending")


def authored_text(value, limit, field):
    need(isinstance(value,str) and 0<len(value.strip())<=limit, f"{field}: da 1 a {limit} caratteri.")
    need(not re.search(r"[<>@\x00-\x1f\x7f-\x9f\ud800-\udfff]|(?:[a-z][a-z0-9+.-]*://|(?:https?|javascript|data|mailto|file|blob|vbscript)\s*:|www\.|//|\b[\w-]+\.(?:it|com|org|net|edu|gov|io|dev)\b)",value,re.I),
         f"{field}: inserisci solo testo, senza markup o indirizzi.")
    return value.strip()


def validate_authored(source):
    fields={"schema","id","status","profile","runtimeAuthorized","publicationAuthorized","title","description","nodes","edges"}
    need(isinstance(source,dict) and source.keys()==fields,"Struttura della fonte non valida.")
    fixed={"schema":"trama.diagram-education-source/v0.1","id":"diagramma-docente",
        "status":"TEACHER_REVIEW_REQUIRED","profile":"studio-atlas"}
    need(all(source[k]==v for k,v in fixed.items()) and source["runtimeAuthorized"] is False
         and source["publicationAuthorized"] is False,"Identità o autorizzazioni della fonte non valide.")
    title=authored_text(source["title"],26,"Titolo")
    description=authored_text(source["description"],160,"Finalità")
    need(isinstance(source["nodes"],list) and 1<=len(source["nodes"])<=4,"Inserisci da 1 a 4 nodi.")
    nodes=[]
    ids=set()
    for index,node in enumerate(source["nodes"],1):
        need(isinstance(node,dict) and node.keys()=={"id","label","detail"},f"Struttura del nodo {index} non valida.")
        node_id=node["id"]
        need(isinstance(node_id,str) and re.fullmatch(r"n[1-4]",node_id) and node_id not in ids,
            f"Identificativo del nodo {index} non valido o duplicato.")
        ids.add(node_id)
        nodes.append({"id":node_id,"label":authored_text(node["label"],16,f"Etichetta del nodo {index}"),
                      "detail":authored_text(node["detail"],22,f"Dettaglio del nodo {index}")})
    edges=source["edges"]
    need(isinstance(edges,list) and len(edges)<=8,"Inserisci al massimo 8 relazioni.")
    seen=set()
    for edge in edges:
        need(isinstance(edge,list) and len(edge)==2 and all(isinstance(n,str) and n in ids for n in edge)
             and edge[0]!=edge[1],"Ogni relazione deve collegare due nodi presenti e distinti.")
        need(tuple(edge) not in seen,"Relazione duplicata.")
        seen.add(tuple(edge))
    return {**fixed,"runtimeAuthorized":False,"publicationAuthorized":False,
            "title":title,"description":description,"nodes":nodes,"edges":edges}


def authored_package(source):
    manifest,_,profile_hash,_=load_inputs()
    profile=next(p for p in manifest["profiles"] if p["id"]==source["profile"])
    names={node["id"]: node["label"] for node in source["nodes"]}
    guide=[source["title"],"="*len(source["title"]),"","Finalità: "+source["description"],"",
           "## Nodi",""]
    guide.extend(f"- {n['label']}: {n['detail']}" for n in source["nodes"])
    guide.extend(["","## Relazioni",""])
    guide.extend([f"- {names[a]} → {names[b]}" for a,b in source["edges"]] or ["Nessuna relazione esplicita."])
    guide.extend(["","Verificare contenuto e leggibilità prima di qualsiasi uso con la classe.",""])
    files={"education-source.json":json.dumps(source,ensure_ascii=False,indent=2)+"\n",
           "guida-docente.md":"\n".join(guide)}
    for variant in VARIANTS:
        doc,svg,_=render(profile,source,variant,footer="Tecnologia · proposta didattica",include_details=True,authored=True)
        validate(svg,profile,variant)
        files[f"diagramma-docente-{variant}.html"]=doc
        files[f"diagramma-docente-{variant}.svg"]=svg
    receipt={"schema":"trama.diagram-education-receipt/v0.2","status":"GENERATED_TEACHER_REVIEW_REQUIRED",
        "runtimeAuthorized":False,"publicationAuthorized":False,"profilesSha256":profile_hash,
        "rendererSha256":sha(pathlib.Path(__file__).read_bytes()),"sourceOrigin":"teacher-authored",
        "files":{name:sha(content.encode("utf-8")) for name,content in files.items()}}
    files["education-receipt.json"]=json.dumps(receipt,ensure_ascii=False,indent=2)+"\n"
    return files


def authored_stdio():
    data=sys.stdin.buffer.read(8193)
    try:
        need(len(data)<=8192,"La fonte supera 8 KiB.")
        source=json.loads(data.decode("utf-8"))
    except (UnicodeError,json.JSONDecodeError):
        print(json.dumps({"error":"La fonte deve essere un documento JSON UTF-8 valido."}))
        return
    except (ValueError,RecursionError):
        print(json.dumps({"error":"La fonte supera i limiti della struttura JSON."}))
        return
    try:
        source=validate_authored(source)
    except ValueError as error:
        print(json.dumps({"error":str(error)}))
        return
    print(json.dumps({"files":authored_package(source)}))


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--out",type=pathlib.Path)
    ap.add_argument("--p2-out",type=pathlib.Path)
    ap.add_argument("--education-out",type=pathlib.Path)
    ap.add_argument("--education-stdio",action="store_true")
    args=ap.parse_args()
    if args.education_stdio:
        need(args.out is None and args.p2_out is None and args.education_out is None,"modalità di generazione esclusive")
        authored_stdio()
        return
    if args.education_out is not None:
        need(args.out is None and args.p2_out is None,"modalità di generazione esclusive")
        generate_education(args.education_out)
        return
    if args.p2_out is not None:
        need(args.out is None,"modalità di generazione esclusive")
        generate_p2(args.p2_out)
        return
    need(args.out is not None,"destinazione obbligatoria")
    manifest,source,profile_hash,source_hash=load_inputs()
    args.out.mkdir(parents=True,exist_ok=True)
    results=[]
    for p in manifest["profiles"]:
        for variant in VARIANTS:
            doc,svg,checks=render(p,source,variant)
            validate(svg,p,variant)
            stem=p["id"]+"-"+variant
            doc_bytes,svg_bytes=doc.encode("utf-8"),svg.encode("utf-8")
            (args.out/(stem+".html")).write_bytes(doc_bytes)
            (args.out/(stem+".svg")).write_bytes(svg_bytes)
            results.append({"id":stem,"profile":p["id"],"variant":variant,"contrast":checks,
                "htmlSha256":sha(doc_bytes),"svgSha256":sha(svg_bytes),"staticGrammar":"PASS"})
    # Prove source changes reach visible and accessible text in both variants.
    changed=json.loads(json.dumps(source))
    changed["title"]="Preparazione di documenti"
    changed["nodes"][0]["label"]="Verifica delle fonti"
    semantic_results={}
    for variant in VARIANTS:
        doc,svg,_=render(manifest["profiles"][0],changed,variant)
        validate(svg,manifest["profiles"][0],variant)
        root=ET.fromstring(svg)
        labels=[e.text for e in root.iter(f"{{{NS}}}text")]
        expected=changed["description"]+" Fasi: "+"; ".join(n["label"] for n in changed["nodes"])+"."
        need(changed["title"] in labels and changed["nodes"][0]["label"] in labels,"updated visible source")
        need(source["title"] not in labels and source["nodes"][0]["label"] not in labels,"stale visible source")
        need(root.find(f"{{{NS}}}desc").text==expected,"updated accessible source")
        need(root.find(f"{{{NS}}}title").text==changed["title"]+" — "+manifest["profiles"][0]["name"],"accessible title")
        need(svg in doc and root.get(XML_LANG)=="it","language and HTML parity")
        semantic_results[variant]="PASS"
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
       "wrongLanguage":svg.replace('xml:lang="it"','xml:lang="en"'),
       "wrongAccessibleReference":svg.replace('aria-describedby="diagram-desc"','aria-describedby="diagram-title"'),
       "duplicateAccessibleId":svg.replace('id="diagram-desc"','id="diagram-title"'),
    }
    rejected={}
    for key,mutant in cases.items():
        need(mutant!=svg,"unchanged fixture")
        try: validate(mutant,p,"mobile-vertical")
        except (ValueError,ET.ParseError): rejected[key]="PASS"
        else: raise ValueError("accepted negative fixture: "+key)
    receipt={"schema":"trama.diagram-profile-receipt/v0.1","status":"GENERATED_NOT_REVIEWED",
       "sourceSha256":source_hash,"profilesSha256":profile_hash,"outputs":results,
       "rejections":rejected,"semanticUpdates":semantic_results,"runtimeAuthorized":False,"publicationAuthorized":False}
    (args.out/"profile-receipt.json").write_bytes((json.dumps(receipt,indent=2)+"\n").encode("utf-8"))
    print(f"Generated {len(results)} static pairs; {len(rejected)} rejection cases PASS")

if __name__=="__main__":
    main()
