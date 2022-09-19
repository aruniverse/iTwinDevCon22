import { registerTool } from "@itwin/core-extension";
import { ExtensionSelectTool } from "./SelectTool";
import { IotMarkerExtension } from "./IotMarkerExtension";

export default function activate() {
  registerTool(ExtensionSelectTool);
  IotMarkerExtension.start();
}
