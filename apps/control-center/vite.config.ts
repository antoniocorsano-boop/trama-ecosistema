import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function governedDataPlugin(): Plugin {
  const root = resolve(import.meta.dirname, "../..");
  const assets = [
    {
      source: resolve(root, "control-center/data/ecosystem-snapshot.json"),
      fileName: "data/ecosystem-snapshot.json",
    },
    {
      source: resolve(root, "control-center/data/context-packs/project-knowledge.json"),
      fileName: "data/context-packs/project-knowledge.json",
    },
  ];

  return {
    name: "trama-governed-data",
    apply: "build",
    generateBundle() {
      for (const asset of assets) {
        this.emitFile({
          type: "asset",
          fileName: asset.fileName,
          source: readFileSync(asset.source),
        });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), governedDataPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
