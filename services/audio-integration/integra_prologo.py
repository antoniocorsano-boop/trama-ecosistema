#!/usr/bin/env python3
"""Integrate exact AF-08 audio into a NEW offline V7-derived candidate. Never publish."""
import argparse, base64, hashlib, json, math, re, struct, wave
from pathlib import Path
SOURCE='6f6b8d3d525373fd5b91b58d3eec31af2d76778e9a3c006d20b80021983e3030'
SCRIPT='5d66b16b503d4d1c85b153dd32fc4ad3f8abd209d9515c7f5d61f9b9d357aeed'
MANIFEST='407299aa62ac3a190ff6755ac35bf4874d786cab0255e1f8dee426415315f395'
HEAD='5175fbfd9f40b1b6d8a1e30bc765b33444643644'
RUN='43467596519'
def sha(b): return hashlib.sha256(b).hexdigest()
def digest(p): return sha(p.read_bytes())
def require(ok,msg):
    if not ok: raise ValueError(msg)
def read_wav(p):
    with wave.open(str(p),'rb') as w:
        require((w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getcomptype())==(1,2,24000,'NONE'),'WAV_FORMAT')
        n=w.getnframes(); pcm=w.readframes(n)
        require(n>0 and len(pcm)==n*2,'WAV_TRUNCATED'); return pcm

def load_story(html):
    m=re.search(r'const STORY=(\[.*?\]);\nconst THREAD=',html,re.S)
    require(m is not None,'STORY_MISSING'); story=json.loads(m.group(1)); require(len(story)==5,'STORY_COUNT'); return story

def validate(source, folder):
    require(digest(source)==SOURCE,'SOURCE_DIGEST'); html=source.read_text(); story=load_story(html)
    r=json.loads((folder/'receipt.json').read_text()); plans=json.loads((folder/'scene-plan.json').read_text()); a=json.loads((folder/'asr-review.json').read_text())
    require(r.get('contract')=='trama.af08-v7-production-candidate/v0.1' and r.get('activity_id')=='trama-missione-118-2026' and r.get('source_version')=='0.3.0-draft' and r.get('source_manifest_sha256')==MANIFEST and r.get('script_sha256')==SCRIPT and r.get('commit')==HEAD and str(r.get('run_id'))==RUN,'RECEIPT_BINDING')
    require(r.get('compute_mode')=='FREE_ONLY' and r.get('published') is False and r.get('review_state')=='HUMAN_LISTENING_PENDING','RECEIPT_POLICY')
    require(digest(folder/'script.md')==SCRIPT,'SCRIPT_DIGEST')
    require(a.get('commit')==HEAD and a.get('script_sha256')==SCRIPT and a.get('audio_approved') is False and a.get('pronunciation_verified') is False,'ASR_BINDING')
    rows=r['results']; m=r['montage']; timing=m['scenes']; asr=a['scenes']; require(all(len(x)==5 for x in (rows,plans,timing,asr)),'SCENE_COUNT')
    montage=folder/'prologo.wav'; require(digest(montage)==m['sha256'] and m['sample_rate']==24000 and m['inter_scene_pause_ms']==500,'MONTAGE_DIGEST')
    pcm=read_wav(montage); pos=0; cues=[]; notes=[]
    for i,(s,p,row,t,review) in enumerate(zip(story,plans,rows,timing,asr,strict=True),1):
        require(all(x['scene']==i for x in (p,row,t,review)),'SCENE_ORDER')
        spoken=s['text'].replace('AX-118','a iks centodiciotto')
        require(p['canonical_text']==s['text'] and p['spoken_text']==spoken and p['canonical_sha256']==sha(s['text'].encode()) and p['spoken_sha256']==sha(spoken.encode()),'TEXT_BINDING')
        planhash=sha(json.dumps(p,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
        require(row['status']=='CANDIDATE_PENDING_LISTENING' and row['plan_sha256']==planhash,'PLAN_BINDING')
        wav=folder/f'scene-{i}.wav'; h=digest(wav); frames=read_wav(wav); end=pos+len(frames)//2
        samples=[v[0] for v in struct.iter_unpack('<h',frames)]
        rms=math.sqrt(sum(v*v for v in samples)/len(samples))/32768
        peak=max(abs(v) for v in samples)/32768
        require(max(.6,len(spoken.strip())/30)<=len(samples)/24000<=40 and rms>=.002 and peak<.999,'SIGNAL_QUALITY')
        require(row['wav_sha256']==t['sha256']==review['wav_sha256']==h and review['expected']==spoken and bool(review['observed'].strip()),'AUDIO_BINDING')
        require(t['start_frame']==pos and t['end_frame']==end and pcm[2*pos:2*end]==frames,'MONTAGE_PCM')
        cues.append({'start':pos/24000,'end':end/24000,'scene':i}); notes.append({'scene':i,'differences':review['differences']})
        pos=end
        if i<5:
            require(pcm[2*pos:2*(pos+12000)]==bytes(24000),'MONTAGE_PAUSE'); pos+=12000
    require(pos*2==len(pcm) and abs(m['duration_seconds']-pos/24000)<1e-6,'MONTAGE_LENGTH')
    return html,cues,montage.read_bytes(),notes

RUNTIME=r'''const AUDIO_CUES=__CUES__;
const narration=new Audio();narration.preload='metadata';narration.src='data:audio/wav;base64,__AUDIO__';
let audioEpoch=0, audioError=false;
function stopNarration(){audioEpoch++;narration.pause();playing=false;}
function positionNarration(i){try{narration.currentTime=AUDIO_CUES[i].start;}catch(e){audioError=true;}}
function beginNarration(){if(!prologue||audioError)return;const epoch=++audioEpoch;playing=true;renderStory(false);narration.play().catch(()=>{if(epoch!==audioEpoch||!prologue)return;audioError=true;stopNarration();renderStory(false);});}
function navigateNarration(i){const resume=playing;stopNarration();slide=i;positionNarration(i);renderStory(true);if(resume)beginNarration();}
function syncNarration(){if(!prologue||!playing)return;const t=narration.currentTime;let i=0;for(let k=1;k<AUDIO_CUES.length;k++)if(t>=AUDIO_CUES[k].start)i=k;if(i!==slide){slide=i;renderStory(false);}}
narration.addEventListener('timeupdate',syncNarration);
narration.addEventListener('ended',()=>{if(!prologue)return;stopNarration();slide=STORY.length-1;renderStory(false);});
narration.addEventListener('error',()=>{audioError=true;stopNarration();if(prologue)renderStory(false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&prologue&&playing){stopNarration();renderStory(false);}});
'''

def once(html,old,new):
    require(html.count(old)==1,'PATCH_ANCHOR'); return html.replace(old,new,1)
def integrate(html,cues,audio):
    html=once(html,"media-src 'none';","media-src data:;")
    html=once(html,'Il futuro è da riprogettare · V7','Il futuro è da riprogettare · V8 candidato')
    code=RUNTIME.replace('__CUES__',json.dumps(cues,separators=(',',':'))).replace('__AUDIO__',base64.b64encode(audio).decode())
    html=once(html,'let prologue=false,slide=0,playing=false,storyTimer=null;','let prologue=false,slide=0,playing=false,storyTimer=null;\n'+code)
    html=once(html,'Racconto illustrato · Testo a schermo · Voce in attesa di revisione',"${audioError?'Audio non disponibile. Puoi leggere il racconto e cambiare scena.':'Racconto illustrato · Testo a schermo · Audio in revisione'}")
    html=once(html,"if(playing){storyTimer=setTimeout(()=>{if(slide<STORY.length-1){slide++;renderStory(false)}else{playing=false;renderStory(false)}},sc.duration*1000)}",'')
    html=once(html,'function leaveStory(toMission){cancelStoryTimer();playing=false;','function leaveStory(toMission){cancelStoryTimer();stopNarration();')
    html=once(html,'cancelStoryTimer();playing=false;prologue=false;slide=0;state=fresh();','cancelStoryTimer();stopNarration();prologue=false;slide=0;state=fresh();')
    html=once(html,"if(a==='story-open'){prologue=true;slide=0;playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;renderStory(true)}", "if(a==='story-open'){stopNarration();prologue=true;slide=0;positionNarration(0);renderStory(true)}")
    html=once(html,"slide=Math.max(0,slide-1);renderStory(true)","navigateNarration(Math.max(0,slide-1))")
    html=once(html,"slide=slide===STORY.length-1?0:slide+1;renderStory(true)","navigateNarration(slide===STORY.length-1?0:slide+1)")
    html=once(html,"playing=!playing;renderStory(false);app.querySelector('[data-action=story-play]')?.focus()", "if(playing){stopNarration();renderStory(false)}else{if(narration.ended)positionNarration(slide);beginNarration()}app.querySelector('[data-action=story-play]')?.focus()")
    html=once(html,"${btn(playing?'Pausa':'Riproduci','story-play','back')}","${btn(playing?'Pausa':'Riproduci','story-play','back',audioError?'disabled':'')}")
    require(re.search(r'const ART=.*?;\n',html,re.S) is not None,'ART_MISSING'); return html

def main():
    p=argparse.ArgumentParser(); p.add_argument('source',type=Path);p.add_argument('audio_folder',type=Path);p.add_argument('output',type=Path); args=p.parse_args()
    html,cues,audio,notes=validate(args.source,args.audio_folder)
    args.output.mkdir(parents=True,exist_ok=False)
    result=integrate(html,cues,audio); output=args.output/'Missione_118_V8_candidato.html'; output.write_text(result,encoding='utf-8')
    (args.output/'montaggio-receipt.json').write_text(json.dumps({'status':'HUMAN_LISTENING_PENDING_NO_PUBLICATION','source_sha256':SOURCE,'audio_sha256':sha(audio),'html_sha256':digest(output),'cues':cues,'asr_review':notes,'subtitle_granularity':'SCENE','publication_authorized':False},ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':main()
