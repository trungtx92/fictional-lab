import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 is taken by Fictional-lab-frontend, so both apps can run side by side.
    port: 5174,
  },
});
