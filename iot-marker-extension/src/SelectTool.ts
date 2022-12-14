import {
  BeButtonEvent,
  CoordinateLockOverrides,
  EventHandled,
  LocateResponse,
  PrimitiveTool,
  ExtensionHost,
} from "@itwin/core-extension";

/** Minimalistic extension tool for a user to pick a set of elements of interest */
export class ExtensionSelectTool extends PrimitiveTool {
  public static override toolId = "TestExtension.Select";
  public static override iconSpec = "icon-cursor";
  public static override hidden = false;
  public static override namespace = "ExampleTools";

  public override requireWriteableTarget(): boolean {
    return false;
  }
  public override autoLockTarget(): void {}

  protected initTool(): void {
    this.initLocateElements(
      true,
      false,
      "default",
      CoordinateLockOverrides.All
    );
  }

  public override async onDataButtonUp(
    ev: BeButtonEvent
  ): Promise<EventHandled> {
    // Act as a selection tool, updating the currently selected elements
    if (undefined === ev.viewport) return EventHandled.No;

    const hit = await ExtensionHost.locateManager.doLocate(
      new LocateResponse(),
      true,
      ev.point,
      ev.viewport,
      ev.inputSource
    );
    if (hit !== undefined && !hit.isModelHit)
      // model hit = terrain, reality models, background maps, etc - not selectable
      this.iModel.selectionSet.replace(hit.sourceId);

    return EventHandled.Yes;
  }

  public override async onRestartTool(): Promise<void> {
    this.exitTool();
  }

  public override async onPostInstall(): Promise<void> {
    super.onPostInstall();
    this.initTool();
  }

  public static async startTool(): Promise<boolean> {
    return new ExtensionSelectTool().run();
  }
}
