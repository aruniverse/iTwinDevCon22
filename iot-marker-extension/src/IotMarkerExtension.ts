/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { QueryRowFormat } from "@itwin/core-common";
import { ExtensionHost } from "@itwin/core-extension";
import { SmartDeviceDecorator } from "./SmartDeviceDecorator";

export class IotMarkerExtension {
  public static start = () => {
    ExtensionHost.viewManager.onViewOpen.addOnce(async (vp) => {
      vp.overrideDisplayStyle({
        viewflags: {
          visEdges: false,
          shadows: false,
        },
      });

      const categoriesToHide = [
        "'Wall 2nd'",
        "'Wall 1st'",
        "'Dry Wall 2nd'",
        "'Dry Wall 1st'",
        "'Brick Exterior'",
        "'WINDOWS 1ST'",
        "'WINDOWS 2ND'",
        "'Ceiling 1st'",
        "'Ceiling 2nd'",
        "'Callouts'",
        "'light fixture'",
        "'Roof'",
      ];

      const query = `SELECT ECInstanceId FROM Bis.Category
        WHERE CodeValue IN (${categoriesToHide.toString()})`;

      const result = vp.iModel.query(query, undefined, {
        rowFormat: QueryRowFormat.UseJsPropertyNames,
      });

      const categoryIds = [];
      for await (const row of result) categoryIds.push(row.id);

      vp.changeCategoryDisplay(categoryIds, false);

      ExtensionHost.viewManager.addDecorator(new SmartDeviceDecorator(vp));
    });
  };
}
