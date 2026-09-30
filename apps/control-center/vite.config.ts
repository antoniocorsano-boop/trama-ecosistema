import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'self'",
  "img-src 'self' data:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join("; ");

function standaloneSnapshotValidatorPlugin(): Plugin {
  const root = resolve(import.meta.dirname, "../..");
  const virtualId = "virtual:trama-ecosystem-validator";
  const resolvedId = "\0" + virtualId;

  return {
    name: "trama-standalone-snapshot-validator",
    resolveId(id) {
      return id === virtualId ? resolvedId : null;
    },
    load(id) {
      if (id !== resolvedId) return null;

      const schema = JSON.parse(
        readFileSync(resolve(root, "schemas/ecosystem-snapshot.schema.json"), "utf8"),
      );
      const ajv = new Ajv2020({
        allErrors: true,
        strict: false,
        validateFormats: false,
        code: { source: true, esm: true },
      });
      const validate = ajv.compile(schema);
      return standaloneCode(ajv, validate);
    },
  };
}

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
  plugins: [
    react(),
    standaloneSnapshotValidatorPlugin(),
    governedDataPlugin(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src/pwa",
      filename: "sw.ts",
      injectRegister: false,
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      manifestFilename: "manifest.json",
      manifest: {
        name: "TRAMA Control Center",
        short_name: "TRAMA",
        description: "TRAMA Control Center: stato, maturità, assurance ed evidenze in sola lettura.",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "any",
        background_color: "#061b31",
        theme_color: "#061b31",
        lang: "it",
        categories: ["education", "productivity"],
        icons: [
          { src: "./icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "./icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      injectManifest: {
        rollupFormat: "iife",
        globPatterns: ["**/*.{js,css,html,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  preview: {
    headers: {
      "Content-Security-Policy": CSP,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
