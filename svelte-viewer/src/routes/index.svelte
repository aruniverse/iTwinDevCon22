<!--
Copyright (c) Bentley Systems, Incorporated. All rights reserved.
See LICENSE.md in the project root for license terms and full copyright notice.
-->

<script lang="ts">
  import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
  import { IModelsClient } from "@itwin/imodels-client-management";
  import { BrowserAuthorizationCallbackHandler } from "@itwin/browser-authorization";
  import type { BrowserAuthorizationClientConfiguration } from "@itwin/browser-authorization";
  import {
    BentleyCloudRpcManager,
    IModelReadRpcInterface,
    IModelTileRpcInterface,
  } from "@itwin/core-common";
  import { IModelApp, LocalExtensionProvider } from "@itwin/core-frontend";
  import { PresentationRpcInterface } from "@itwin/presentation-common";
  import MyExtension from "my-extension";
  import AuthClient from "../utils/clients/Authorization";
  import ConfigClient from "../utils/clients/Configuration";
  import type { ViewerConfiguration } from "../utils/clients/Configuration";
  import Viewport from "../components/Viewport.svelte";
  import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
  import { onMount } from "svelte";

  const signIn = async (
    authConfig: BrowserAuthorizationClientConfiguration
  ) => {
    try {
      await BrowserAuthorizationCallbackHandler.handleSigninCallback(
        authConfig.redirectUri
      );
    } catch (error) {
      console.error(error);
    }

    AuthClient.initialize(authConfig);
    const authClient = AuthClient.client;

    return new Promise<boolean>((resolve, reject) => {
      authClient.onAccessTokenChanged.addOnce((token: string) =>
        resolve(token !== "")
      );
      authClient.signIn().catch((err: any) => reject(err));
    });
  };

  const initialize = async (config: ViewerConfiguration) => {
    const iModelsClient = new IModelsClient();

    await IModelApp.startup({
      authorizationClient: AuthClient.client,
      hubAccess: new FrontendIModelsAccess(iModelsClient),
      rpcInterfaces: [IModelReadRpcInterface],
      mapLayerOptions: {
        BingMaps: {
          key: "key",
          value: config.map?.bingKey ?? "",
        },
      },
    });
    BentleyCloudRpcManager.initializeClient(
      {
        uriPrefix: "https://api.bentley.com",
        info: { title: "imodel/rpc", version: "" },
      },
      [IModelReadRpcInterface, IModelTileRpcInterface, PresentationRpcInterface]
    );
    await addExtensions();
  };

  /**
   * Add iTwin.js extensions
   */
  const addExtensions = async () => {
    await IModelApp.extensionAdmin.addExtension(
      new LocalExtensionProvider(MyExtension)
    );
  };

  /**
   * App startup
   */
  let iTwinId = "";
  let iModelId = "";
  onMount(async () => {
    await ConfigClient.initialize();
    const config = ConfigClient.config;
    await signIn(config.authorization);
    console.log("Signed in...");
    await initialize(config);
    console.log("Initialized...");
    iTwinId = config.iTwinId;
    iModelId = config.iModelId;
  });
</script>

<main>
  {#if iTwinId == "" || iModelId == ""}
    <span id="viewer-loading-span">Initializing and signing in...</span>
  {:else}
    <Viewport {iTwinId} {iModelId} />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  #viewer-loading-span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
</style>
