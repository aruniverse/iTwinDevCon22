import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  envPrefix: "IMJS_",
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/@itwin/*/lib/public/*",
          dest: ".",
        },
      ],
    }),
  ],
});
