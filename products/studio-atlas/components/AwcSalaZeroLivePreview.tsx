"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_RECIPE, MATERIAL_PRESETS, type SceneVisualRecipe } from "../lib/scene-visual-recipe";
import { makeEnvironment, OPTICAL_ENV_INTENSITY, makeSurfaceMaps, SURFACE_MAP_SIZE, SURFACE_RELIEF, type SurfaceRole } from "../lib/scene-optics";
import {
  AWC_S3B_SCENE,
  AWC_S3B_ENGINE_VERSION,
  cameraEye,
  lightingValues,
  nextOrbit,
  type AwcLightProfile,
  validateAwcSceneSpec,
} from "../lib/awc-s3b-scene";

type Driver = {
  reset: () => void;
  setSignal: (signal: "A" | "B") => void;
  setProfile: (profile: AwcLightProfile) => void;
  rotate: (deltaPixels: number) => void;
  setRecipe: (recipe: SceneVisualRecipe) => void;
};
type Signal = "A" | "B";

/** Non montare alcun contesto WebGL fino al comando esplicito del docente. */
export function AwcSalaZeroLivePreview({recipe=DEFAULT_RECIPE}:{recipe?:SceneVisualRecipe} = {}) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [orbit, setOrbit] = useState(0);
  const [signal, setSignal] = useState<Signal>("A");
  const [profile, setProfile] = useState<AwcLightProfile>("balanced");
  const host = useRef<HTMLDivElement>(null);
  const driver = useRef<Driver | null>(null);
  const latestRecipe=useRef(recipe);
  useEffect(()=>{latestRecipe.current=recipe;driver.current?.setRecipe(recipe);},[recipe]);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let cleanup = () => {};
    setError("");
    setReady(false);

    async function mount() {
      let renderer: import("three").WebGLRenderer | undefined;
      let resizeObserver: ResizeObserver | undefined;
      let contextLost: ((event: Event) => void) | undefined;
      let canvas: HTMLCanvasElement | undefined;
      let timer = 0;
      let opticalTarget: import("three").WebGLRenderTarget | undefined;
      let colorTexture: import("three").DataTexture | undefined;
      let heightTexture: import("three").DataTexture | undefined;
      let appliedSurface: SceneVisualRecipe["material"] = "original";
      const geometry: import("three").BufferGeometry[] = [];
      const materials: import("three").Material[] = [];
      const target = host.current;
      if (!target) return;
      try {
        validateAwcSceneSpec();
        // The exact r128 engine used by the qualified AWC-F renderer.
        const T = await import("three");
        if (disposed) return;
        canvas = document.createElement("canvas");
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", "Sala Zero tridimensionale, ruota trascinando o con le frecce. Tasto Home per ripristinare.");
        canvas.setAttribute("tabindex", "0");
        canvas.className = "awc-live-canvas";
        target.appendChild(canvas);

        const gl = canvas.getContext("webgl", {
          alpha: false, antialias: true, preserveDrawingBuffer: false,
          depth: true, stencil: false, powerPreference: "low-power",
        });
        if (!gl) throw new Error("WebGL non disponibile sul dispositivo");
        renderer = new T.WebGLRenderer({
          canvas, context: gl, antialias: true, alpha: false,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputEncoding = T.sRGBEncoding;
        renderer.toneMapping = T.ACESFilmicToneMapping;

        const scene = new T.Scene();
        scene.background = new T.Color(AWC_S3B_SCENE.world.background);
        const hemisphere = new T.HemisphereLight(0xd8f0ff, 0x243b55, 1.1);
        scene.add(hemisphere);
        const mainLight = new T.DirectionalLight(0xffefd1, 2);
        const sourceLight = AWC_S3B_SCENE.world.lightPosition;
        mainLight.position.set(sourceLight[0], sourceLight[1], sourceLight[2]);
        mainLight.shadow.mapSize.set(1024, 1024);
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 30;
        mainLight.shadow.camera.left = -5.8;
        mainLight.shadow.camera.right = 5.8;
        mainLight.shadow.camera.top = 5.8;
        mainLight.shadow.camera.bottom = -5.8;
        mainLight.shadow.bias = -0.0005;
        mainLight.shadow.normalBias = 0.035;
        scene.add(mainLight);
        const fill = new T.PointLight(0x70c7ed, 1.7, 15);
        fill.position.set(2, 0, 3.8);
        scene.add(fill);
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        // The lights/objects never move; camera orbit reuses the cached depth map.
        renderer.shadowMap.autoUpdate = false;

        const matMap = new Map<string, import("three").MeshStandardMaterial>();
        for (const [key, spec] of Object.entries(AWC_S3B_SCENE.materials)) {
          const material = new T.MeshStandardMaterial({
            color: new T.Color(spec.color),
            roughness: spec.roughness,
            metalness: "metalness" in spec ? Number(spec.metalness) : 0,
          });
          materials.push(material);
          matMap.set(key, material);
        }
        const floor = matMap.get("floor");
        if (!floor) throw new Error("Superficie di prova mancante");
        const originalFloorColor = floor.color.clone();
        const projection = matMap.get("screen");
        if (!projection) throw new Error("Proiezione AWC-F mancante");

        for (const object of AWC_S3B_SCENE.objects) {
          const material = matMap.get(object.material);
          if (!material) throw new Error("Materiale AWC-F non verificato");
          const shape = new T.BoxGeometry(object.size[0], object.size[1], object.size[2]);
          geometry.push(shape);
          const mesh = new T.Mesh(shape, material);
          mesh.name = object.id;
          mesh.position.set(object.position[0], object.position[1], object.position[2]);
          mesh.castShadow = ["console-plinth", "console-panel", "sensor-A", "sensor-B"].includes(object.id);
          mesh.receiveShadow = true;
          scene.add(mesh);
        }

        const cfg = AWC_S3B_SCENE.camera;
        const camera = new T.PerspectiveCamera(cfg.fov, cfg.width / cfg.height, cfg.near, cfg.far);
        camera.up.set(0, 0, 1);
        let localOrbit = 0;
        let localSignal: Signal = "A";
        let localProfile: AwcLightProfile = "balanced";
        let pointerX: number | null = null;

        const paint = () => {
          if (!renderer || disposed) return;
          const eye = cameraEye(localOrbit);
          camera.position.set(eye[0], eye[1], eye[2]);
          camera.lookAt(new T.Vector3(cfg.center[0], cfg.center[1], cfg.center[2]));
          camera.updateMatrixWorld(true);
          projection.color.set(localSignal === "B" ? "#224b57" : "#23384c");
          projection.emissive.set(localSignal === "B" ? "#67d9ca" : "#1d3448");
          projection.emissiveIntensity = localSignal === "B" ? 3 : 0.08;
          renderer.render(scene, camera);
        };
        const schedulePaint = () => {
          if (timer) return;
          timer = window.requestAnimationFrame(() => { timer = 0; paint(); });
        };
        const rotate = (deltaPixels: number) => {
          localOrbit = nextOrbit(localOrbit, deltaPixels);
          setOrbit(localOrbit);
          schedulePaint();
        };
        const setSignalLocal = (next: Signal) => {
          localSignal = next;
          setSignal(next);
          schedulePaint();
        };
        const setProfileLocal = (next: AwcLightProfile) => {
          localProfile = next;
          const lighting = lightingValues(next);
          hemisphere.intensity = lighting.hemisphere;
          mainLight.intensity = lighting.directional;
          fill.intensity = lighting.fill;
          mainLight.castShadow = lighting.shadows;
          if (renderer) {
            renderer.toneMappingExposure = lighting.exposure;
            renderer.shadowMap.enabled = lighting.shadows;
            renderer.shadowMap.needsUpdate = lighting.shadows;
          }
          setProfile(localProfile);
          schedulePaint();
        };
        const setRecipe = (next:SceneVisualRecipe) => {
          const preset=MATERIAL_PRESETS[next.material];
          // Allocate once, on explicit material selection, never per animation frame.
          if (next.material !== "original" && !opticalTarget && renderer) {
            const source = new T.DataTexture(makeEnvironment(),256,128,T.RGBAFormat,T.UnsignedByteType);
            source.mapping = T.EquirectangularReflectionMapping;
            source.encoding = T.LinearEncoding;
            source.minFilter = source.magFilter = T.LinearFilter;
            source.needsUpdate = true;
            const generator = new T.PMREMGenerator(renderer);
            try { opticalTarget = generator.fromEquirectangular(source); }
            finally { source.dispose(); generator.dispose(); }
          }
          const nextMap = next.material === "original" ? null : opticalTarget?.texture ?? null;
          if (floor.envMap !== nextMap) { floor.envMap = nextMap; floor.needsUpdate = true; }
          floor.envMapIntensity = nextMap ? OPTICAL_ENV_INTENSITY[next.material] : 1;
          if(appliedSurface!==next.material){
            let nextColor: import("three").DataTexture | undefined;
            let nextHeight: import("three").DataTexture | undefined;
            if(next.material!=="original"){
              const maps=makeSurfaceMaps(next.material);
              nextColor=new T.DataTexture(maps.color,SURFACE_MAP_SIZE,SURFACE_MAP_SIZE,T.RGBAFormat,T.UnsignedByteType);
              nextHeight=new T.DataTexture(maps.height,SURFACE_MAP_SIZE,SURFACE_MAP_SIZE,T.RGBAFormat,T.UnsignedByteType);
              nextColor.encoding=T.sRGBEncoding;
              for(const texture of [nextColor,nextHeight]){
                texture.minFilter=texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
              }
            }
            colorTexture?.dispose();heightTexture?.dispose();
            colorTexture=nextColor;heightTexture=nextHeight;
            floor.map=colorTexture??null;floor.bumpMap=heightTexture??null;
            floor.bumpScale=next.material==="original"?1:SURFACE_RELIEF[next.material as SurfaceRole];
            if(next.material==="original")floor.color.copy(originalFloorColor);else floor.color.set(0xffffff);
            floor.needsUpdate=true;appliedSurface=next.material;
          }
          floor.roughness=preset.roughness;floor.metalness=preset.metalness;
          canvas?.setAttribute("data-optical-profile", nextMap ? next.material : "original");
          localOrbit=next.orbit;setOrbit(localOrbit);
          setProfileLocal(next.light);schedulePaint();
        };
        const reset = () => {
          localOrbit = 0;
          setOrbit(0);
          setSignalLocal("A");
          schedulePaint();
        };
        const onDown = (event: PointerEvent) => {
          if (!canvas) return;
          pointerX = event.clientX;
          canvas.setPointerCapture(event.pointerId);
        };
        const onMove = (event: PointerEvent) => {
          if (pointerX === null) return;
          const delta = event.clientX - pointerX;
          pointerX = event.clientX;
          rotate(delta);
        };
        const onEnd = () => { pointerX = null; };
        const onKey = (event: KeyboardEvent) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); rotate(-10); }
          if (event.key === "ArrowRight") { event.preventDefault(); rotate(10); }
          if (event.key === "Home") { event.preventDefault(); reset(); }
        };
        contextLost = (event: Event) => {
          event.preventDefault();
          setReady(false);
          setError("Il dispositivo ha interrotto la visualizzazione 3-D. Chiudi e riapri la prova.");
        };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerup", onEnd);
        canvas.addEventListener("pointercancel", onEnd);
        canvas.addEventListener("lostpointercapture", onEnd);
        canvas.addEventListener("keydown", onKey);
        canvas.addEventListener("webglcontextlost", contextLost);

        const resize = () => {
          if (!renderer || !target) return;
          const width = Math.max(180, Math.min(720, Math.round(target.clientWidth || 320)));
          const height = Math.round(width * cfg.height / cfg.width);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          schedulePaint();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(target);
        resize();
        setRecipe(latestRecipe.current);
        paint();
        driver.current = { reset, setSignal: setSignalLocal, setProfile: setProfileLocal, rotate, setRecipe };
        setReady(true);

        cleanup = () => {
          driver.current = null;
          if (timer) window.cancelAnimationFrame(timer);
          resizeObserver?.disconnect();
          if (canvas) {
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onEnd);
            canvas.removeEventListener("pointercancel", onEnd);
            canvas.removeEventListener("lostpointercapture", onEnd);
            canvas.removeEventListener("keydown", onKey);
            canvas.removeEventListener("webglcontextlost", contextLost!);
            canvas.remove();
          }
          geometry.forEach((value) => value.dispose());
          materials.forEach((value) => value.dispose());
          colorTexture?.dispose();heightTexture?.dispose();
          opticalTarget?.dispose();
          renderer?.dispose();
          renderer?.forceContextLoss();
        };
      } catch (reason) {
        if (!disposed) {
          setReady(false);
          setError(reason instanceof Error ? reason.message : "La visualizzazione 3-D non è disponibile");
        }
        if (timer) window.cancelAnimationFrame(timer);
        resizeObserver?.disconnect();
        canvas?.remove();
        geometry.forEach((value) => value.dispose());
        materials.forEach((value) => value.dispose());
        colorTexture?.dispose();heightTexture?.dispose();
        opticalTarget?.dispose();
        renderer?.dispose();
        renderer?.forceContextLoss();
      }
    }
    void mount();
    return () => { disposed = true; cleanup(); };
  }, [active]);

  return (
    <section className="awc-live-panel" aria-labelledby="awc-live-heading">
      <h4 id="awc-live-heading">Esplora la Sala Zero · laboratorio 3-D</h4>
      <p className="world-composer-note">
        Ambiente WebGL realmente navigabile, ricostruito dalla specifica AWC-F immutabile
        e dal medesimo motore Three.js r128. Non è la biblioteca Atlas né un ambiente approvato per gli studenti.
      </p>
      {!active ? (
        <button className="primary-action" type="button" onClick={() => setActive(true)}>
          Apri la Sala Zero navigabile
        </button>
      ) : (
        <>
          <div className="awc-live-toolbar">
            <button type="button" className="secondary-action" disabled={!ready}
              onClick={() => driver.current?.reset()}>Ripristina inquadratura</button>
            <button type="button" className="secondary-action" disabled={!ready}
              onClick={() => driver.current?.setSignal(signal === "A" ? "B" : "A")}>
              {signal === "A" ? "Simula segnale B" : "Torna al segnale A"}
            </button>
            <button type="button" className="quiet-action" onClick={() => setActive(false)}>
              Chiudi ambiente 3-D
            </button>
          </div>
          <div className="awc-live-controls" role="group" aria-label="Confronto dell'illuminazione">
            <button type="button" className={profile === "balanced" ? "secondary-action is-current" : "secondary-action"}
              disabled={!ready} aria-pressed={profile === "balanced"}
              onClick={() => driver.current?.setProfile("balanced")}>Luce equilibrata · prova</button>
            <button type="button" className={profile === "reference" ? "secondary-action is-current" : "secondary-action"}
              disabled={!ready} aria-pressed={profile === "reference"}
              onClick={() => driver.current?.setProfile("reference")}>Luce originale AWC-F</button>
          </div>
          <div className="awc-live-stage" ref={host} />
          {error && <p role="alert" className="awc-evidence-error">{error}</p>}
          <p className="world-composer-note" role="status" aria-live="polite">
            {error ? "Prova sospesa." : ready
              ? `3-D attivo · rotazione ${orbit.toFixed(2)} radianti · segnale ${signal} · ${profile === "balanced" ? "luce equilibrata" : "luce originale"}`
              : "Preparazione del motore tridimensionale…"}
          </p>
          <div className="awc-live-steering">
            <button type="button" className="secondary-action" disabled={!ready}
              onClick={() => driver.current?.rotate(-10)}>Ruota a sinistra</button>
            <button type="button" className="secondary-action" disabled={!ready}
              onClick={() => driver.current?.rotate(10)}>Ruota a destra</button>
          </div>
          <p className="world-composer-note">
            Trascina sulla scena per ruotare. In alternativa usa i pulsanti o i tasti freccia.
            L’illuminazione equilibrata è un’ipotesi artistica reversibile, non una
            certificazione di equivalenza con Blender. Nessun salvataggio o invio di dati.
            Il profilo di composizione agisce sul pavimento di prova, sulla luce e sull’inquadratura. I materiali alternativi usano mappe cromatiche e micro-rilievo procedurali, con riflessi da una mappa ambientale sintetica locale, non riflessi della stanza reale. I colori originali, la geometria e i segnali restano invariati. Motore {AWC_S3B_ENGINE_VERSION}.
          </p>
        </>
      )}
    </section>
  );
}
