/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CheckpointConnection, SelectionSetEvent } from "@itwin/core-frontend";
import {
  GeometrySummaryRequestProps,
  GeometrySummaryVerbosity,
  IModelReadRpcInterface,
} from "@itwin/core-common";

/**
 * add a listener for the selection set changed event
 */
export class ElementSelectionListener {
  private _iModel: CheckpointConnection;

  constructor(iModel: CheckpointConnection) {
    this._iModel = iModel;
    iModel.selectionSet.onChanged.addListener(this._onSelectionChanged);
  }

  /**
   * log info about the selected elements to the console
   * @param evt
   */
  private _onSelectionChanged = async (evt: SelectionSetEvent) => {
    const elementIds = Array.from(evt.set.elements);
    const request: GeometrySummaryRequestProps = {
      elementIds,
      options: {
        geometryVerbosity: GeometrySummaryVerbosity.Detailed,
        includePlacement: true,
      },
    };
    const geometryString = await IModelReadRpcInterface.getClientForRouting(
      this._iModel.routingContext.token
    ).getGeometrySummary(this._iModel.getRpcProps(), request);

    console.log(geometryString); // eslint-disable-line no-console
    elementIds.forEach(async (elementId) => {
      const tooltipString = await IModelReadRpcInterface.getClientForRouting(
        this._iModel.routingContext.token
      ).getToolTipMessage(this._iModel.getRpcProps(), elementId);
      console.log(tooltipString); // eslint-disable-line no-console
    });
  };
}
