import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function videoAliasPlugin(): Plugin {
  return {
    name: "video-alias-plugin",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/banner-vid.mp4")) {
          req.url = req.url.replace("/banner-vid.mp4", "/bannervid.mp4");
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/banner-vid.mp4")) {
          req.url = req.url.replace("/banner-vid.mp4", "/bannervid.mp4");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), videoAliasPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Only the code export renders to HTML; keep the server renderer out of the eagerly loaded React chunk.
            if (id.includes("react-dom-server") || id.includes("react-dom/server")) {
              return undefined;
            }
            if (id.includes("@puckeditor")) {
              return "vendor-puck";
            }
            if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("@heroui") || id.includes("@react-aria")) {
              return "vendor-heroui";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("zod")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
