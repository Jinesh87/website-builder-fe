import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Builds the live-site renderer: one self-contained Node file, no node_modules needed at runtime. */
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    ssr: "src/site-renderer/server.ts",
    outDir: "dist-renderer",
    emptyOutDir: true,
    target: "node22",
    rollupOptions: { output: { entryFileNames: "server.mjs" } },
  },
  ssr: { noExternal: true, target: "node" },
});
