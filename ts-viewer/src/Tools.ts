/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  ActionButton,
  StageUsage,
  ToolbarOrientation,
  ToolbarUsage,
  UiItemsManager,
} from "@itwin/appui-abstract";
import {
  FitViewTool,
  IModelApp,
  PanViewTool,
  RotateViewTool,
  WindowAreaTool,
} from "@itwin/core-frontend";
import "./Tools.css";

/**
 * add a tool bar and buttons within the toolbar for some iTwin.js tool definitions
 * @param container
 */
export const addToolbar = (container: HTMLDivElement) => {
  // add a horizontal toolbar to the DOM
  const verticalToolBar = document.createElement("div");
  verticalToolBar.className = "viewer-horizontal-tool-bar";

  // get toolbar items from extensions first
  // these will include the sample "Select Tool" extension that we loaded in index.ts
  // this extension is a mirror of the core Select Tool with a different iconSpec that was added solely to show how to add/load an extension
  const toolbarButtons = UiItemsManager.getToolbarButtonItems(
    "",
    StageUsage.General,
    ToolbarUsage.ContentManipulation,
    ToolbarOrientation.Vertical
  ) as ActionButton[];

  // Add buttons for some built-in tools
  // https://github.com/iTwin/itwinjs-core/tree/master/core/frontend/src/tools

  // add the rotate point tool
  toolbarButtons.push({
    id: RotateViewTool.toolId,
    execute: async () => IModelApp.tools.run(RotateViewTool.toolId),
    label: RotateViewTool.flyover,
    description: RotateViewTool.description,
    icon: RotateViewTool.iconSpec,
    itemPriority: 2,
  });

  // add the view pan tool
  toolbarButtons.push({
    id: PanViewTool.toolId,
    execute: async () => IModelApp.tools.run(PanViewTool.toolId),
    label: PanViewTool.flyover,
    description: PanViewTool.description,
    icon: PanViewTool.iconSpec,
    itemPriority: 3,
  });

  // add the fit view tool
  toolbarButtons.push({
    id: FitViewTool.toolId,
    execute: async () => IModelApp.tools.run(FitViewTool.toolId),
    label: FitViewTool.flyover,
    icon: FitViewTool.iconSpec,
    description: FitViewTool.description,
    itemPriority: 4,
  });

  // add the window area tool
  toolbarButtons.push({
    id: WindowAreaTool.toolId,
    execute: async () => IModelApp.tools.run(WindowAreaTool.toolId),
    label: WindowAreaTool.flyover,
    description: WindowAreaTool.description,
    icon: WindowAreaTool.iconSpec,
    itemPriority: 5,
  });

  // add the buttons to the DOM
  toolbarButtons.forEach((toolbarButton: ActionButton) => {
    const button = document.createElement("button");
    button.className = "viewer-tool-button";
    button.id = toolbarButton.id;
    if (toolbarButton.label) {
      const toolTip = document.createElement("span");
      toolTip.textContent = toolbarButton.label as string;
      toolTip.className = "viewer-tool-button-tip";
      button.appendChild(toolTip);
    }
    if (toolbarButton.icon) {
      const icon = document.createElement("i");
      icon.className = `icon ${toolbarButton.icon as string}`;
      button.appendChild(icon);
    }

    button.onclick = toolbarButton.execute;
    verticalToolBar.appendChild(button);
  });

  // append the toolbar to the container
  container.appendChild(verticalToolBar);
};
