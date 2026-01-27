import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    // 1️⃣ alza la soglia del warning (non è un errore)
    chunkSizeWarningLimit: 1200,

    // 2️⃣ split intelligente dei bundle
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@fullcalendar")) return "fullcalendar";
            if (id.includes("@mui")) return "mui";
            if (id.includes("date-fns")) return "datefns";
            return "vendor";
          }
        },
      },
    },
  },
});
