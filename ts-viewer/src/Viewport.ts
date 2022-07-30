/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  CheckpointConnection,
  IModelApp,
  ScreenViewport,
  ViewCreator3d,
} from "@itwin/core-frontend";
import { ElementSelectionListener } from "./ElementSelectionListener";
import { addToolbar } from "./Tools";

/**
 * Establish a connection, generate a view state, and add a viewport to the DOM
 * @param parentDiv
 * @param iTwinId
 * @param iModelId
 */
export const addViewport = async (
  parentDiv: HTMLDivElement,
  iTwinId: string,
  iModelId: string,
) => {
  const iModelConnection = await CheckpointConnection.openRemote(
    iTwinId,
    iModelId,
  );
  if (iModelConnection) {
    // add a listener to selection events
    new ElementSelectionListener(iModelConnection);

    // create a container div
    const viewPortContainer = document.createElement("div");
    viewPortContainer.style.height = "100vh";
    viewPortContainer.style.width = "100%";
    viewPortContainer.id = "viewport-container";
    parentDiv.appendChild(viewPortContainer);

    // obtain a viewState for the model and add it to a Viewport within the container
    const viewCreator = new ViewCreator3d(iModelConnection);
    const viewState = await viewCreator.createDefaultView();
    const vp = ScreenViewport.create(viewPortContainer, viewState);
    IModelApp.viewManager.addViewport(vp);

    // overlay tool buttons
    addToolbar(viewPortContainer);
  }
};
