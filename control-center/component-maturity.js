(function(root){
  'use strict';

  const SVG_NS='http://www.w3.org/2000/svg';
  const STAGES=['REGISTERED','ISOLATED','BEHAVIOURAL','RESPONSIVE_VISUAL','ACCESSIBILITY'];
  const STAGE_LABELS={
    REGISTERED:'Registrato',
    ISOLATED:'Isolato',
    BEHAVIOURAL:'Comportamento',
    RESPONSIVE_VISUAL:'Responsive / visuale',
    ACCESSIBILITY:'Accessibilità'
  };
  const PRODUCT_LABELS={
    ARENA:'Arena',
    ATLAS:'Atlas',
    DOCENTE_OS:'Docente OS',
    'DOCENTE OS':'Docente OS',
    TRAMA_CONTROL_CENTER:'Control Center'
  };
  const LIFECYCLE_LABELS={
    PROPOSED:'Proposto',
    TRIAL:'In prova',
    STABLE:'Stabile',
    LEGACY:'Legacy',
    DEPRECATED:'Deprecato',
    RETIRED:'Ritirato',
    SPECIALIST:'Specialistico',
    NATIVE:'Nativo'
  };
  const SOURCE_LABELS={
    NATIVE_PLATFORM:'Piattaforma nativa',
    PRODUCT_OWNED:'Componente del prodotto',
    TRAMA_SHARED_SEMANTIC:'Semantica condivisa TRAMA',
    EXTERNAL_PRIMITIVE:'Primitiva esterna',
    SPECIALIST_LIBRARY:'Libreria specialistica'
  };
  const EVIDENCE_STATUS_LABELS={
    PRESENT:'Presente',
    PARTIAL:'Parziale',
    DOCUMENTED_ONLY:'Solo documentata',
    NOT_OBSERVED:'Non osservata',
    NOT_APPLICABLE:'Non applicabile'
  };
  const PRODUCT_COLORS={
    ARENA:'#5dd39e',
    ATLAS:'#ae88ff',
    DOCENTE_OS:'#ffc45a',
    'DOCENTE OS':'#ffc45a',
    TRAMA_CONTROL_CENTER:'#58bff7'
  };

  function stageIndex(stage){
    const i=STAGES.indexOf(stage);
    return i<0?0:i;
  }

  function productLabel(product){
    return PRODUCT_LABELS[product]||String(product||'Non assegnato').replaceAll('_',' ');
  }

  function productColor(product){
    return PRODUCT_COLORS[product]||'#9fb9cb';
  }

  function lifecycleLabel(value){
    return LIFECYCLE_LABELS[value]||String(value||'—').replaceAll('_',' ');
  }

  function sourceLabel(value){
    return SOURCE_LABELS[value]||String(value||'—').replaceAll('_',' ');
  }

  function evidenceStatusLabel(value){
    return EVIDENCE_STATUS_LABELS[value]||String(value||'—').replaceAll('_',' ');
  }

  function evidenceDisplayLabel(item){
    const status=evidenceStatusLabel(item?.status||'NOT_OBSERVED');
    return item?.sourcePlane==='LIVE_VERIFIED'?status+' · live verificata':status;
  }

  function shortName(component){
    const target=String(component.target||'');
    if(target){
      const last=target.split('/').pop()||target;
      return last.replace(/\.(tsx?|jsx?|html|vue|svelte)$/i,'');
    }
    if(component.semanticPattern)return String(component.semanticPattern);
    const parts=String(component.componentId||'Componente').split('.');
    return parts.length>1?parts.slice(1).join(' · '):parts[0];
  }

  function evidenceGapLabel(type){
    return {
      ISOLATED:'prova isolata',
      BEHAVIOURAL:'prova comportamentale',
      RESPONSIVE_VISUAL:'prova responsive/visuale',
      ACCESSIBILITY:'prova di accessibilità'
    }[type]||String(type||'').replaceAll('_',' ').toLowerCase();
  }

  function componentDescription(component){
    const m=component.maturity||{};
    const remaining=(m.remainingEvidenceTypes||[]).map(evidenceGapLabel);
    return [
      shortName(component)+'.',
      'Prodotto: '+productLabel(component.product)+'.',
      'Maturità confermata: '+(STAGE_LABELS[m.confirmedStage]||m.confirmedStage||'non disponibile')+'.',
      'Candidata: '+(STAGE_LABELS[m.candidateStage]||m.candidateStage||'non disponibile')+'.',
      'Ciclo di vita: '+lifecycleLabel(component.lifecycle)+'.',
      remaining.length?'Evidenze ancora richieste: '+remaining.join(', ')+'.':'Catena evidenziale completa.'
    ].join(' ');
  }

  function buildModel(components,filterProduct='ALL'){
    const source=Array.isArray(components)?components:[];
    const filtered=filterProduct==='ALL'?source:source.filter(c=>c.product===filterProduct);
    const products=[...new Set(filtered.map(c=>c.product||'UNASSIGNED'))].sort((a,b)=>productLabel(a).localeCompare(productLabel(b),'it'));
    const byProduct=new Map(products.map(p=>[p,filtered.filter(c=>(c.product||'UNASSIGNED')===p).sort((a,b)=>String(a.componentId).localeCompare(String(b.componentId)))]));
    const width=1040;
    const left=176;
    const right=38;
    const top=82;
    const laneHeight=132;
    const height=Math.max(260,top+products.length*laneHeight+38);
    const usable=width-left-right;
    const xForStage=stage=>left+(usable/(STAGES.length-1))*stageIndex(stage);
    const nodes=[];
    products.forEach((product,laneIndex)=>{
      const items=byProduct.get(product)||[];
      const laneCenter=top+laneIndex*laneHeight+54;
      const spread=Math.min(30,items.length>1?62/(items.length-1):0);
      items.forEach((component,itemIndex)=>{
        const offset=items.length===1?0:(itemIndex-(items.length-1)/2)*spread;
        const confirmed=component.maturity?.confirmedStage||'REGISTERED';
        const candidate=component.maturity?.candidateStage||confirmed;
        nodes.push({
          component,
          product,
          x:xForStage(confirmed),
          candidateX:xForStage(candidate),
          y:laneCenter+offset,
          confirmed,
          candidate,
          label:shortName(component)
        });
      });
    });
    return {width,height,left,right,top,laneHeight,products,nodes,stages:STAGES.map(stage=>({stage,x:xForStage(stage),label:STAGE_LABELS[stage]}))};
  }

  function svgEl(name,attrs={}){
    const el=document.createElementNS(SVG_NS,name);
    Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));
    return el;
  }

  function shapeFor(component,x,y,color){
    const cls='component-node-shape';
    const source=component.sourceClass;
    let el;
    if(source==='NATIVE_PLATFORM'){
      el=svgEl('rect',{x:x-10,y:y-10,width:20,height:20,rx:3});
    }else if(source==='EXTERNAL_PRIMITIVE'){
      el=svgEl('polygon',{points:`${x},${y-12} ${x+12},${y} ${x},${y+12} ${x-12},${y}`});
    }else if(source==='TRAMA_SHARED_SEMANTIC'){
      el=svgEl('polygon',{points:`${x},${y-12} ${x+12},${y+10} ${x-12},${y+10}`});
    }else if(source==='SPECIALIST_LIBRARY'){
      el=svgEl('polygon',{points:`${x-11},${y-6} ${x},${y-12} ${x+11},${y-6} ${x+11},${y+6} ${x},${y+12} ${x-11},${y+6}`});
    }else{
      el=svgEl('circle',{cx:x,cy:y,r:11});
    }
    el.setAttribute('class',cls);
    el.setAttribute('fill',color);
    el.setAttribute('stroke','#071827');
    el.setAttribute('stroke-width','3');
    if(['LEGACY','DEPRECATED','RETIRED'].includes(component.lifecycle))el.setAttribute('stroke-dasharray','4 3');
    return el;
  }

  function setText(el,text){el.textContent=text;return el}

  function clear(el){while(el.firstChild)el.removeChild(el.firstChild)}

  function renderDetail(container,component){
    clear(container);
    if(!component){
      const p=document.createElement('p');
      p.className='hint';
      p.textContent='Seleziona un componente nella mappa o nell’elenco.';
      container.appendChild(p);
      return;
    }
    const maturity=component.maturity||{};
    const title=document.createElement('h3');
    title.textContent=shortName(component);
    const meta=document.createElement('div');
    meta.className='component-detail-meta';
    meta.textContent=productLabel(component.product)+' · '+lifecycleLabel(component.lifecycle)+' · '+sourceLabel(component.sourceClass);
    const stage=document.createElement('div');
    stage.className='component-detail-stage';
    stage.innerHTML='<span>Confermato</span><strong></strong><span>Candidato</span><strong></strong>';
    stage.children[1].textContent=STAGE_LABELS[maturity.confirmedStage]||maturity.confirmedStage||'—';
    stage.children[3].textContent=STAGE_LABELS[maturity.candidateStage]||maturity.candidateStage||'—';
    const evidenceTitle=document.createElement('strong');
    evidenceTitle.textContent='Evidenze';
    const evidence=document.createElement('ul');
    evidence.className='component-evidence-mini';
    ['ISOLATED','BEHAVIOURAL','RESPONSIVE_VISUAL','ACCESSIBILITY'].forEach(type=>{
      const item=document.createElement('li');
      const evidenceItem=component.evidenceStatus?.[type]||{status:'NOT_OBSERVED'};
      const status=evidenceItem.status||'NOT_OBSERVED';
      item.innerHTML='<span></span><b></b>';
      item.children[0].textContent=evidenceGapLabel(type);
      item.children[1].textContent=evidenceDisplayLabel(evidenceItem);
      item.dataset.status=status;
      evidence.appendChild(item);
    });
    const gaps=document.createElement('p');
    gaps.className='component-detail-gaps';
    const remaining=(maturity.remainingEvidenceTypes||[]).map(evidenceGapLabel);
    gaps.textContent=remaining.length?'Mancano: '+remaining.join(', ')+'.':'Nessuna evidenza residua nella catena v1.';
    const source=document.createElement('small');
    source.className='mono component-source';
    source.textContent=component.sourceRef||'fonte non disponibile';
    const link=document.createElement('a');
    link.className='report-link component-evidence-link';
    link.href='./evidence.html';
    link.textContent='Apri Evidence Explorer →';
    container.append(title,meta,stage,evidenceTitle,evidence,gaps,source,link);
  }

  function renderEquivalent(container,components,select){
    clear(container);
    const heading=document.createElement('div');
    heading.className='component-equivalent-head';
    heading.innerHTML='<strong>Elenco equivalente</strong><span>stesse informazioni, utilizzabili anche senza la mappa</span>';
    container.appendChild(heading);
    if(!components.length){
      const empty=document.createElement('div');
      empty.className='empty';
      empty.textContent='Nessun componente disponibile per questo filtro.';
      container.appendChild(empty);
      return;
    }
    const list=document.createElement('div');
    list.className='component-equivalent-list';
    components.forEach(component=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='component-equivalent-item';
      button.dataset.componentId=component.componentId;
      const m=component.maturity||{};
      const main=document.createElement('span');
      main.innerHTML='<strong></strong><small></small>';
      main.children[0].textContent=shortName(component);
      main.children[1].textContent=productLabel(component.product)+' · '+lifecycleLabel(component.lifecycle);
      const stage=document.createElement('span');
      stage.className='component-equivalent-stage';
      stage.innerHTML='<small>Confermato</small><b></b>';
      stage.children[1].textContent=STAGE_LABELS[m.confirmedStage]||m.confirmedStage||'—';
      button.append(main,stage);
      button.addEventListener('click',()=>select(component,true));
      button.addEventListener('focus',()=>select(component,false));
      list.appendChild(button);
    });
    container.appendChild(list);
  }

  function renderMap(svg,model,select){
    clear(svg);
    svg.setAttribute('viewBox',`0 0 ${model.width} ${model.height}`);
    svg.setAttribute('aria-label','Mappa della maturità dei componenti. L’asse orizzontale mostra le fasi evidenziali; le corsie mostrano i prodotti.');
    const bg=svgEl('rect',{x:0,y:0,width:model.width,height:model.height,rx:18,class:'component-map-bg'});
    svg.appendChild(bg);

    model.stages.forEach(({stage,x,label})=>{
      svg.appendChild(svgEl('line',{x1:x,y1:48,x2:x,y2:model.height-24,class:'component-stage-line'}));
      const text=svgEl('text',{x,y:30,class:'component-stage-label','text-anchor':'middle'});
      setText(text,label);
      svg.appendChild(text);
    });

    model.products.forEach((product,laneIndex)=>{
      const y=model.top+laneIndex*model.laneHeight+54;
      const lane=svgEl('line',{x1:model.left-20,y1:y,x2:model.width-model.right,y2:y,class:'component-lane-line'});
      svg.appendChild(lane);
      const label=svgEl('text',{x:18,y:y+4,class:'component-lane-label'});
      setText(label,productLabel(product));
      svg.appendChild(label);
    });

    model.nodes.forEach(node=>{
      const c=node.component;
      const color=productColor(node.product);
      if(node.candidateX>node.x){
        svg.appendChild(svgEl('line',{
          x1:node.x+12,y1:node.y,x2:node.candidateX-10,y2:node.y,
          class:'component-candidate-link'
        }));
      }
      const g=svgEl('g',{
        class:'component-node',
        tabindex:'0',
        role:'button',
        'data-component-id':c.componentId,
        'aria-label':componentDescription(c)
      });
      g.appendChild(shapeFor(c,node.x,node.y,color));
      const label=svgEl('text',{x:node.x+16,y:node.y+4,class:'component-node-label'});
      setText(label,node.label);
      g.appendChild(label);
      g.addEventListener('mouseenter',()=>select(c,false));
      g.addEventListener('focus',()=>select(c,false));
      g.addEventListener('click',()=>select(c,true));
      g.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          select(c,true);
        }
      });
      svg.appendChild(g);
    });
  }

  function render(options){
    const components=Array.isArray(options.components)?options.components:[];
    const svg=options.svg;
    const filters=options.filters;
    const detail=options.detail;
    const equivalent=options.equivalent;
    if(!svg||!filters||!detail||!equivalent)return {destroy(){}};

    let filter='ALL';
    const deferSelection=Boolean(options.deferSelection);
    let selected=deferSelection?null:(components[0]||null);

    function select(component,pinned){
      selected=component;
      renderDetail(detail,component);
      svg.querySelectorAll('.component-node').forEach(node=>{
        node.classList.toggle('is-selected',node.dataset.componentId===component?.componentId);
      });
      equivalent.querySelectorAll('.component-equivalent-item').forEach(item=>{
        item.classList.toggle('is-selected',item.dataset.componentId===component?.componentId);
      });
      if(pinned)detail.dataset.pinned='true';
    }

    function redraw(){
      const model=buildModel(components,filter);
      renderMap(svg,model,select);
      const visible=model.nodes.map(n=>n.component);
      renderEquivalent(equivalent,visible,select);
      if(selected&&!visible.some(c=>c.componentId===selected.componentId))selected=null;
      if(!selected&&!deferSelection)selected=visible[0]||null;
      renderDetail(detail,selected);
      if(selected)select(selected,false);
      filters.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',btn.dataset.product===filter?'true':'false'));
    }

    clear(filters);
    const products=[...new Set(components.map(c=>c.product).filter(Boolean))].sort((a,b)=>productLabel(a).localeCompare(productLabel(b),'it'));
    [{id:'ALL',label:'Tutti'},...products.map(p=>({id:p,label:productLabel(p)}))].forEach(item=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.product=item.id;
      button.setAttribute('aria-pressed',item.id==='ALL'?'true':'false');
      button.textContent=item.label;
      button.addEventListener('click',()=>{filter=item.id;redraw()});
      filters.appendChild(button);
    });

    redraw();
    return {redraw,select,getFilter:()=>filter};
  }

  const api={STAGES,STAGE_LABELS,LIFECYCLE_LABELS,SOURCE_LABELS,EVIDENCE_STATUS_LABELS,buildModel,componentDescription,productLabel,lifecycleLabel,sourceLabel,evidenceStatusLabel,evidenceDisplayLabel,shortName,render};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.TRAMAMaturityMap=api;
})(typeof window!=='undefined'?window:globalThis);
