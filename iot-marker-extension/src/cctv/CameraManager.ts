import { BeEvent } from "@itwin/core-bentley";
import { CCTVCamera } from "./CCTVCamera";

  /** Facilitates orchestration for an "selected" camera. */
  export class CameraManager {
    public static namespaceId = "CCTV-Simulation";
    /** An event for the camera changing. */
    public static onSelectedChanged = new BeEvent<(newCamera: CCTVCamera | undefined) => void>();
    private static _selectedCamera: CCTVCamera | undefined; 
    /** Returns the selected camera. */
    public static get selectedCamera(): CCTVCamera | undefined {
      return CameraManager._selectedCamera;
    }
    /** Change the selected camera.  Will trigger event. */
    public static changeActive(newCamera: CCTVCamera | undefined) {
      this._selectedCamera = newCamera;
      this.onSelectedChanged.raiseEvent(newCamera);
    }
  }