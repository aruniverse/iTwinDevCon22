/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import type { BrowserAuthorizationClientConfiguration } from "@itwin/browser-authorization";

interface ViewerMapConfiguration {
  bingKey: string;
}

export interface ViewerConfiguration {
  authorization: BrowserAuthorizationClientConfiguration;
  iTwinId: string;
  iModelId: string;
  map?: ViewerMapConfiguration;
}

/**
 * Configuration client
 */
class ConfigurationClient {
  private static _config: ViewerConfiguration;

  public static async initialize() {
    this._config = {
      authorization: {
        clientId: process.env.IMJS_AUTH_CLIENT_CLIENT_ID ?? "",
        scope: process.env.IMJS_AUTH_CLIENT_SCOPES ?? "",
        redirectUri: process.env.IMJS_AUTH_CLIENT_REDIRECT_URI ?? "",
        postSignoutRedirectUri: process.env.IMJS_AUTH_CLIENT_LOGOUT_URI ?? "",
        responseType: process.env.RESPONSE_TYPE ?? "",
        authority: process.env.AUTHORITY ?? "",
      },
      iTwinId: process.env.IMJS_AUTH_CLIENT_ITWIN_ID ?? "",
      iModelId: process.env.IMJS_AUTH_CLIENT_IMODEL_ID ?? "",
      map: {
        bingKey: process.env.BING_KEY ?? "",
      },
    };
  }

  public static get config() {
    return this._config;
  }
}

export default ConfigurationClient;
