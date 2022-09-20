# Extending iTwin.js Applications

## Overview

Code for the iTwin DevCon 2022 Session, _Extending iTwin.js Applications_, with [Caleb Shafer](https://github.com/calebmshafer) and [Arun George](https://github.com/aruniverse).

In this session, we go over some practical examples of how to build apps with [iTwin.js](https://github.com/iTwin/itwinjs-core), and we will demonstrate the power of using [extensions](https://github.com/iTwin/itwinjs-core/blob/master/docs/learning/frontend/Extensions.md) to quickly add the functionality your users care about most in a reusable UI framework agnostic way.

This monorepo contains:

- iTwin Viewers written in:

  - [Vanilla TypeScript](./ts-viewer/)
    - uses vanilla TS to interact with the DOM
  - [React](./react-viewer/)
    - uses [React](https://reactjs.org/)
    - uses [react-scripts](https://www.npmjs.com/package/@bentley/react-scripts), which uses [Webpack](https://webpack.js.org/) under the hood
  - [Svelte](./svelte-viewer/)
    - uses [Svelte](https://svelte.dev/)
    - [SvelteKit](https://kit.svelte.dev/), which uses [Vite](https://vitejs.dev/) under the hood.
      - Note, SvelteKit is pre 1.0, and more breaking changes are expected before 1.0

- Demo Extension:
  - [IoT Marker Extension](./iot-marker-extension/)

## Getting Started

This monorepo uses [pnpm](https://pnpm.io), please make sure to [install](https://pnpm.io/installation) it on your own if you don't have it already. Once you have pnpm, install all required dependencies with `pnpm install`.

### Demo Model

The demo IoT marker extension assumes you are using the provided [Smart House](./House_Model.dgn) model, which you should be familiar with if you've completed our [iTwin Accreditation Course](https://developer.bentley.com/accreditation/).

If you don't already have an iModel of the Smart House, please create one using either the [iTwin Synchronizer](https://www.bentley.com/en/resources/itwin-synchronizer)(Windows only) or by using our [Synchronization APIs](https://developer.bentley.com/apis/synchronization/tutorials/). The fastest way will be to use the synchronization in the [iTwin Demo Portal](https://itwindemo.bentley.com/synchronize).

### Configuration

Create a new client in the [developer portal](https://developer.bentley.com/register/) and update the environment variables for your viewers.
Your client should include the following:

- API Associations
  - Visualization - enable the `imodelaccess:read` scope
  - iModels - enable the `imodels:read` scope
  - Reality Data - enable the `realitydate:read` scope
- Application type - SPA

Note, you can use the same client for all 3 viewers, as long as you have properly setup the redirect URIs.

### Vanilla TypeScript Viewer

- Add your environment variables to the [config file](./ts-viewer/public/config.json)
  - Assumes will run on `localhost:3001`
- `cd ts-viewer`
- `pnpm build`
- `pnpm serve`

### React Viewer

- Add your environment variables to the [env file](./react-viewer/.env)
  - Assumes will run on `localhost:3000`
- `cd react-viewer`
- `pnpm start`

### Svelte Viewer

- Add your environment variables to the [env file](./svelte-viewer/.env)
  - Assumes will run on `localhost:3002`
- `cd svelte-viewer`
- `pnpm dev`
