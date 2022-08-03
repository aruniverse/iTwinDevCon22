<!--
Copyright (c) Bentley Systems, Incorporated. All rights reserved.
See LICENSE.md in the project root for license terms and full copyright notice.
-->

<script lang="ts">
  import {
    StageUsage,
    ToolbarOrientation,
    ToolbarUsage,
    UiItemsManager,
  } from "@itwin/appui-abstract";
  import type { ActionButton } from "@itwin/appui-abstract";
  import {
    FitViewTool,
    IModelApp,
    PanViewTool,
    RotateViewTool,
    WindowAreaTool,
  } from "@itwin/core-frontend";

  // get toolbar items from extensions first
  // these will include the sample "Select Tool" extension that we loaded in index.ts
  // this extension is a mirror of the core Select Tool with a different iconSpec that was added solely to show how to add/load an extension
  const toolbarButtons = UiItemsManager.getToolbarButtonItems(
    "",
    StageUsage.General,
    ToolbarUsage.ContentManipulation,
    ToolbarOrientation.Vertical
  ) as ActionButton[];

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
</script>

<main>
  <div class="viewer-horizontal-tool-bar">
    {#each toolbarButtons as toolbarButton}
      <button
        class="viewer-tool-button"
        id={toolbarButton.id}
        on:click={toolbarButton.execute}
      >
        {#if toolbarButton.label}
          <span class="viewer-tool-button-tip">{toolbarButton.label}</span>
        {/if}
        {#if toolbarButton.icon}
          <i class="icon {toolbarButton.icon}" />
        {/if}
      </button>
    {/each}
  </div>
</main>

<style>
  .viewer-horizontal-tool-bar {
    position: absolute;
    display: flex;
    flex-direction: row;
    left: 25px;
    top: 25px;
    width: calc(100% - 50px);
    height: 45px;
  }

  .viewer-tool-button {
    height: 45px;
    width: 45px;
    opacity: 0.25;
    transition: 0.3s;
    cursor: pointer;
    z-index: 11;
  }

  .viewer-tool-button:hover {
    opacity: 0.5;
  }

  .viewer-tool-button .viewer-tool-button-tip {
    visibility: hidden;
    background-color: black;
    color: white;
    padding: 5px;
    font-size: smaller;
    text-align: center;
    /* Position the tooltip */
    position: absolute;
    top: 45px;
    z-index: 1;
  }

  .viewer-tool-button:hover .viewer-tool-button-tip {
    visibility: visible;
  }
</style>
