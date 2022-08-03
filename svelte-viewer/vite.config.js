/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { sveltekit } from "@sveltejs/kit/vite";
import * as dotenv from "dotenv-flow";
import { dirname } from "path";

dotenv.config();

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  define: {
    "process.env": process.env,
    __dirname: { dirname },
  },
  server: {
    port: 3002,
  },
};

export default config;
