/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
import { IModelsClient } from "@itwin/imodels-client-management";
import {
  BrowserAuthorizationCallbackHandler,
  BrowserAuthorizationClientConfiguration,
} from "@itwin/browser-authorization";
import {
  BentleyCloudRpcManager,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
} from "@itwin/core-common";
import { IModelApp, LocalExtensionProvider } from "@itwin/core-frontend";
import { PresentationRpcInterface } from "@itwin/presentation-common";
import AuthClient from "./clients/Authorization";
import ConfigClient, { ViewerConfiguration } from "./clients/Configuration";
import { addViewport } from "./Viewport";
import MyExtension from "my-extension";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

/**
 * Sign in or handle sign in callback
 * @param authConfig
 * @returns
 */
const signIn = async (authConfig: BrowserAuthorizationClientConfiguration) => {
  try {
    await BrowserAuthorizationCallbackHandler.handleSigninCallback(
      authConfig.redirectUri
    );
  } catch {}

  AuthClient.initialize(authConfig);
  const authClient = AuthClient.client;

  return new Promise<boolean>((resolve, reject) => {
    authClient.onAccessTokenChanged.addOnce((token) => resolve(token !== ""));
    authClient.signIn().catch((err) => reject(err));
  });
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
 * Initialize iTwin.js
 * @param config
 */
const initialize = async (config: ViewerConfiguration) => {
  const iModelsClient = new IModelsClient();

  await IModelApp.startup({
    authorizationClient: AuthClient.client,
    hubAccess: new FrontendIModelsAccess(iModelsClient),
    rpcInterfaces: [IModelReadRpcInterface],
    mapLayerOptions: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
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

const loadingStatus = (loading: boolean, containerDiv?: HTMLDivElement) => {
  if (loading && containerDiv) {
    const loadingSpan = document.createElement("span");
    loadingSpan.textContent = "Initializing and signing in...";
    loadingSpan.id = "viewer-loading-span";
    loadingSpan.style.margin = "auto";
    containerDiv.append(loadingSpan);
  } else {
    const loadingSpan = document.getElementById("viewer-loading-span");
    loadingSpan?.remove();
  }
};

/**
 * App startup
 */
const startup = async () => {
  const root = document.getElementById("root") as HTMLDivElement;
  loadingStatus(true, root);
  await ConfigClient.initialize();
  const config = ConfigClient.config;
  await signIn(config.authorization);
  await initialize(config);
  loadingStatus(false);
  await addViewport(root, config.iTwinId, config.iModelId);
};

void startup();
