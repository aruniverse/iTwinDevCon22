import { assert } from "@itwin/core-bentley";
import { BeButtonEvent, EventHandled, PrimitiveTool, ToolAssistanceImage } from "@itwin/core-extension";
import { Point3d } from "@itwin/core-geometry";
import { ExtensionHost } from "@itwin/core-extension";
import { CameraManager } from "./CameraManager";
import { CCTVCamera } from "./CCTVCamera";

export type ExitPlaceToolCallback = (newCamera: CCTVCamera | undefined) => void;

/** Facitates placing new CCTV Cameras areound the model. */
export class PlaceCameraTool extends PrimitiveTool {
  /** Starts the tools.
   * @param newCam A callback method that will be called by the tool.  The new camera parameter will be the new camera, or undefiend if the tool was exited without confirming.
   */
  public static placeNewCamera(handleToolExit: ExitPlaceToolCallback): Promise<boolean> {
    return new PlaceCameraTool().run(handleToolExit);
  }
  public static override toolId = "PlaceCameraTool";

  /** Returns the internal state of the tool */
  public getState(): "inactive" | "eye" | "target" | "confirm" {
    if (!this.newCamera)
      return "inactive";
    if (!this.eyePoint)
      return "eye";
    if (!this.targetPoint)
      return "target";
    return "confirm";
  }
  // local caches of data
  public callbackOnExit: ExitPlaceToolCallback = ()=>{};
  public eyePoint: Point3d | undefined;
  public targetPoint: Point3d | undefined;
  public newCamera: CCTVCamera | undefined;
  private _getDefaultCamera(): CCTVCamera {
    return new CCTVCamera({
        eyePoint: Point3d.createZero().toJSONXYZ(),
        targetPoint: Point3d.createZero().toJSONXYZ(),
        lensAngle: 35,
        name: "New Camera",
      },
      this.iModel);
  }

  public override isCompatibleViewport(vp: any | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp && vp.view.isSpatialView()); }
  public override isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; }
  public override requireWriteableTarget(): boolean { return false; }
  public override async onPostInstall() { super.onPostInstall(); this.setupAndPromptForNextAction(); }
  public override async onRestartTool() {
    const tool = new PlaceCameraTool();
    if(!await tool.run(this.callbackOnExit))
      return this.exitTool();
  }

  public override async run(handleNewCamera: ExitPlaceToolCallback): Promise<boolean> {
    if (!super.run([handleNewCamera]))
      return false;

    this.callbackOnExit = handleNewCamera;
    this.newCamera = this._getDefaultCamera();
    return true;
  }

  public override getPrompt() {
    let prompt: string;
    switch (this.getState()) {
      case "eye": 
        prompt = "Select the location of the camera";
        break;
      case "target":
        prompt = "Select the focal point of the camera";
        break;
      case "confirm": 
        prompt = "Select to confirm the camera";
        break;
      case "inactive":
        prompt = "Error: Tool inactive, prompt should not be shown";
        break;
    }
    return prompt;
  }

  protected setupAndPromptForNextAction(): void {
    assert(this.targetView !== undefined && this.targetView.view.isSpatialView())
    if (this.getState() === "inactive") return;
    assert(this.newCamera !== undefined);
    // Update camera with new with latest from tool
    this.newCamera.updateProps({
      eyePoint: (this.eyePoint ?? Point3d.createZero()).toJSONXYZ(),
      targetPoint: (this.targetPoint ?? Point3d.createZero()).toJSONXYZ(),
      lensAngle: this.targetView.view.getLensAngle().toJSON(),
    });
    // Visualize factors that have been set
    this.newCamera.setVisualOptions({
      drawFov: this.getState() === "confirm",
      drawTargetBox: this.targetPoint !== undefined,
      useCameraModel: false,
      highVisibilty: true,
      });
    // Notify of updates to the camera
    CameraManager.changeActive(this.newCamera);
    // visualize after raising the event because the widget would clear them
    if (this.getState() === "eye")
      this.newCamera.clearVisualizes();
    else
      this.newCamera.visualize();

    // Manage tool in the IModelApp
    ExtensionHost.accuSnap.enableSnap(this.getState() !== "confirm");
    ExtensionHost.notifications.setToolAssistance({
      mainInstruction: { image: ToolAssistanceImage.LeftClick, text: this.getPrompt() },
      sections: [
        {
          instructions: [
            {
              image: ToolAssistanceImage.RightClick,
              text: this.getState() === "eye" ? "Exit tool" : "Move to the last step",
            }
          ]
        }
      ],
    });
  }

  public override async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    // Right click
    if (this.eyePoint === undefined)
      this.exitTool(false);
    else if (this.targetPoint === undefined)
      this.eyePoint = undefined;
    else
      this.targetPoint = undefined;
    this.setupAndPromptForNextAction();
    return EventHandled.No;
  }

  public override async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    // Left Click
    if (undefined === ev.viewport)
      return EventHandled.No;
    const state = this.getState();
    if (state === "eye")
      this.eyePoint = ev.point.clone();
    else if (state === "target")
      this.targetPoint = ev.point.clone();
    else // state === "confirm"
      this.exitTool(true);

    this.setupAndPromptForNextAction();
    return EventHandled.No;
  }

  /** Method to clean and exit tool.  Will call callback method.
   * @param confirm When true, will pass the new camera to callback method.  Otherwise, will pass undefined.
   */
  public override async exitTool(confirm: boolean = false) {
    // Cleanup camera
    if (this.newCamera) {
      this.newCamera.clearVisualizes();
      this.newCamera.setVisualOptions(CCTVCamera.defaultOptions);
    }
    // if exiting the tool, just dispose the camera
    if (!confirm) this.newCamera?.dispose();
    this.newCamera = confirm ? this.newCamera : undefined;
    this.callbackOnExit(this.newCamera);
    this.newCamera = undefined;
    super.exitTool();
  }
}
