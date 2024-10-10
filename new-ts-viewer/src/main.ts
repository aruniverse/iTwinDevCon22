import "./style.css";

import { FrontendIModelsAccess } from "@itwin/imodels-access-frontend";
import {
  AuthorizationClient,
  BentleyCloudRpcManager,
  CesiumTerrainAssetId,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
} from "@itwin/core-common";
import {
  CheckpointConnection,
  FitViewTool,
  IModelApp,
  ScreenViewport,
  StandardViewId,
  StandardViewTool,
  ViewCreator3d,
} from "@itwin/core-frontend";
import { ECSchemaRpcInterface } from "@itwin/ecschema-rpcinterface-common";
import { PresentationRpcInterface } from "@itwin/presentation-common";
import { Presentation } from "@itwin/presentation-frontend";

const {
  IMJS_ACCESS_TOKEN,
  IMJS_BING_MAPS_KEY,
  IMJS_CESIUM_ION_KEY,
  IMJS_ITWIN_ID,
  IMJS_IMODEL_ID,
} = import.meta.env;

const authClient: AuthorizationClient = {
  getAccessToken: async () => IMJS_ACCESS_TOKEN,
};

const rpcInterfaces = [
  IModelReadRpcInterface,
  IModelTileRpcInterface,
  ECSchemaRpcInterface,
  PresentationRpcInterface,
];

BentleyCloudRpcManager.initializeClient(
  {
    uriPrefix: "https://api.bentley.com",
    info: { title: "imodel/rpc", version: "v4" },
  },
  rpcInterfaces
);

await IModelApp.startup({
  authorizationClient: authClient,
  hubAccess: new FrontendIModelsAccess(),
  rpcInterfaces,
  mapLayerOptions: {
    BingMaps: {
      key: "key",
      value: IMJS_BING_MAPS_KEY,
    },
  },
  tileAdmin: {
    cesiumIonKey: IMJS_CESIUM_ION_KEY,
  },
});

await Presentation.initialize();

const iModelConnection = await CheckpointConnection.openRemote(
  IMJS_ITWIN_ID,
  IMJS_IMODEL_ID
);

// if (iModelConnection) {
//   // add a listener to selection events
//   // new ElementSelectionListener(iModelConnection);

const root = document.querySelector<HTMLDivElement>("#app")!;

// obtain a viewState for the model and add it to a Viewport within the container
const viewCreator = new ViewCreator3d(iModelConnection);
const viewState = await viewCreator.createDefaultView();
const vp = ScreenViewport.create(root, viewState);
IModelApp.viewManager.addViewport(vp);

IModelApp.tools.run(StandardViewTool.toolId, vp, StandardViewId.RightIso);
IModelApp.tools.run(FitViewTool.toolId, vp, true, false);

// vp.changeBackgroundMapProps({
//   terrainSettings: {
//     dataSource: CesiumTerrainAssetId.Bathymetry,
//   }
// })