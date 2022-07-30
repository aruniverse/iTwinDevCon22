/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  BrowserAuthorizationClient,
  BrowserAuthorizationClientConfiguration,
} from "@itwin/browser-authorization";

/**
 * Authorization client
 */
export class AuthorizationClient {
  private static _client: BrowserAuthorizationClient;

  public static initialize(config: BrowserAuthorizationClientConfiguration) {
    this._client = new BrowserAuthorizationClient(config);
  }

  public static get client() {
    return this._client;
  }
}

export default AuthorizationClient;
