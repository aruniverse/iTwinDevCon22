import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  envPrefix: "IMJS_",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/@itwin/*/lib/public/*",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        // Resolve SASS tilde imports.
        find: /^~(.*)$/,
        replacement: "$1",
      },
    ],
  },
  server: {
    open: true,
    port: 3003,
    strictPort: true,
  },
});
