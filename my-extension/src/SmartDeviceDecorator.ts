/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { QueryRowFormat } from "@itwin/core-common";
import { Decorator, IModelConnection, Marker } from "@itwin/core-extension";
import { SmartDeviceMarker } from "./SmartDeviceMarker";

export class SmartDeviceDecorator implements Decorator {
  private _iModel: IModelConnection;
  private _markerSet: Marker[];

  constructor(vp: any) {
    this._iModel = vp.iModel;
    this._markerSet = [];
    this._addMarkers();
  }

  private async _getSmartDeviceData() {
    const query = `
      SELECT  SmartDeviceId,
              SmartDeviceType,
              ECInstanceId,
              Origin
              FROM DgnCustomItemTypes_HouseSchema.SmartDevice
              WHERE Origin IS NOT NULL
    `;

    const results = this._iModel.query(query, undefined, {
      rowFormat: QueryRowFormat.UseJsPropertyNames,
    });

    const values = [];
    for await (const row of results) values.push(row);
    return values;
  }

  private async _addMarkers() {
    const values = await this._getSmartDeviceData();

    values.forEach((value) => {
      const smartDeviceMarker = new SmartDeviceMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z },
        { x: 40, y: 40 },
        value.smartDeviceId,
        value.smartDeviceType,
        value.id
      );

      this._markerSet.push(smartDeviceMarker);
    });
  }

  public decorate(context: any): void {
    this._markerSet.forEach((marker) => {
      marker.addDecoration(context);
    });
  }
}
