import { UiFramework } from "@itwin/appui-react";
import { IModelApp } from "@itwin/core-frontend";
// import { JsonComponent } from "../components/JsonComponent";
import { CCTVCamera } from "./CCTVCamera";

/** Helps create report for the cameras */
  export class CameraReporting {
    /** Capture image of currently active viewport and trigger browser's download action. */
    public static exportImage() {
      const viewPort = IModelApp.viewManager.getFirstOpenView();
      if (viewPort !== undefined) {
        const canvas = viewPort.readImageToCanvas();
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.setAttribute("download", "viewport.png");
        link.setAttribute("href", imageUrl);
        link.click();
      }
    }

    /** Exports the camera list as a json string inside a pop-up dialog */
    public static createCameraJSON(cameraList: CCTVCamera[]) {
      const props = cameraList.map((cam) => cam.toJSON());
      // Here is the JSON string.
      const json = JSON.stringify(props, undefined, 4);
      const id = cameraList.length + " " + Math.random().toPrecision(8);
      // The UiFramework will hanlde window creation, management, and closure for us.
      // UiFramework.childWindowManager.openChildWindow(`popout-${id}`, `Viewport-${id}`,
      // // Specify the Viewport to be rendered in the child window
      // JsonComponent({json}),
      //   // Delare the size and location of child window
      //   { height: 600, width: 400, left: 10, top: 50},
      //   false,
      // );
      
    }
  }