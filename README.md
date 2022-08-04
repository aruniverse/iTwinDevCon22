# Extending iTwin.js Applications

## Overview

Code for the iTwin DevCon 2022 Session, _Extending iTwin.js Applications_, with [Caleb Shafer](https://github.com/calebmshafer) and [Arun George](https://github.com/aruniverse).

This monorepo contains: 

- iTwin Viewers written in:
  - [Vanilla TypeScript](./ts-viewer/)
  - [React](./react-viewer/)
  - [Svelte](./svelte-viewer/)

- Demo Extension:
  - [IoT Marker Extension](./iot-marker-extension/)


## Getting Started

This monorepo uses [pnpm](https://pnpm.io), please make sure to [install](https://pnpm.io/installation) it on your own if you don't have it already. Once you have pnpm, install all required dependencies with `pnpm install`.

### Demo Model

The demo IoT marker extension assumes you are using the provided [Smart House](./House_Model.dgn) model, which you should be familiar with if you've completed our [iTwin Accreditation Course](https://developer.bentley.com/accreditation/).

If you don't already have an iModel of the Smart House, please create one using either the [iTwin Synchronizer](https://www.bentley.com/en/resources/itwin-synchronizer)(Windows only) or by using our [Synchronization APIs](https://developer.bentley.com/apis/synchronization/tutorials/).


### Configuration

Create a new client in the [developer portal](https://developer.bentley.com/register/) and update the environment variables for your viewers.

### Vanilla TypeScript Viewer

- Add your environment variables to the [config file](./ts-viewer/public/config.json)
- Assumes running on `localhost:3001`
- Run `pnpm build` and then `pnpm serve`

### React Viewer

- Add your environment variables to the [env file](./react-viewer/.env)
- Assumes running on `localhost:3000`
- Run `pnpm start`

### Svelte Viewer

- Add your environment variables to the [env file](./svelte-viewer/.env)
- Assumes running on `localhost:3002`
- Run `pnpm dev`
