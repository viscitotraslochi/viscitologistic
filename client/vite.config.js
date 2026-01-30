import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId }) => {
        return deps; 
      },
    },
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // UI
          if (id.includes("@mui")) return "mui";
          if (id.includes("@emotion")) return "emotion";

          // Calendar
          if (id.includes("@fullcalendar")) return "fullcalendar";

          // Date utils
          if (id.includes("date-fns")) return "datefns";

          // Routing
          if (id.includes("react-router")) return "router";

          // Map / geocoding (se li usi)
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "leaflet";

          // Common heavy utils (se presenti)
          if (id.includes("lodash")) return "lodash";

          // Fallback
          return "vendor";
        },
      },
    },
  },
});
