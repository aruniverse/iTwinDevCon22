<!--
Copyright (c) Bentley Systems, Incorporated. All rights reserved.
See LICENSE.md in the project root for license terms and full copyright notice.
-->

<script lang="ts">
  import {
    CheckpointConnection,
    FitViewTool,
    IModelApp,
    ScreenViewport,
    StandardViewId,
    ViewCreator3d,
  } from "@itwin/core-frontend";
  import { ElementSelectionListener } from "../utils/ElementSelectionListener";
  import Tools from "./Tools.svelte";

  export let iTwinId: string;
  export let iModelId: string;

  let viewPortContainer: HTMLDivElement;
  const addViewport = async () => {
    const iModelConnection = await CheckpointConnection.openRemote(
      iTwinId,
      iModelId
    );
    const clientWidth =
      document.getElementById("viewport-container")?.clientWidth ?? 0;
    const clientHeight =
      document.getElementById("viewport-container")?.clientHeight ?? 0;
    if (iModelConnection && clientWidth !== 0 && clientHeight !== 0) {
      // add a listener to selection events
      new ElementSelectionListener(iModelConnection);

      // obtain a viewState for the model and add it to a Viewport within the container
      const viewCreator = new ViewCreator3d(iModelConnection);
      const viewState = await viewCreator.createDefaultView();
      const vp = ScreenViewport.create(viewPortContainer, viewState);
      IModelApp.viewManager.addViewport(vp);
      void IModelApp.tools.run(FitViewTool.toolId, vp, true, false);
      vp.view.setStandardRotation(StandardViewId.Iso);
    }
  };
</script>

<main>
  <div bind:this={viewPortContainer} id="viewport-container" />
  {#await addViewport() then}
    <Tools />
  {/await}
</main>

<style>
  #viewport-container {
    height: 100vh;
    width: 100%;
  }
</style>
