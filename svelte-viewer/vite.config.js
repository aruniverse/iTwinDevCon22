import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { sveltekit } from "@sveltejs/kit/vite";
import copy from "rollup-plugin-copy";
import * as dotenv from "dotenv-flow";
import { dirname } from "path";
import * as packageJson from "./package.json";

dotenv.config();

const iTwinDeps = Object.keys(packageJson.dependencies)
  .filter((pkgName) => pkgName.startsWith("@itwin"))
  .map((pkgName) => `./node_modules/${pkgName}/lib/public/**`);

/** @type {import('vite').UserConfig} */
const config = {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  plugins: [
    sveltekit(),
    copy({
      targets: [
        {
          src: iTwinDeps,
          dest: "/static",
          rename: (_name, _extension, fullPath) => {
            const regex = new RegExp("(public(?:\\\\|/))(.*)");
            return regex.exec(fullPath)[2];
          },
        },
      ],
      verbose: true,
      overwrite: true,
    }),
  ],
  define: {
    "process.env": process.env,
    __dirname: { dirname },
  },
  server: {
    port: 3002,
  },
};

export default config;
