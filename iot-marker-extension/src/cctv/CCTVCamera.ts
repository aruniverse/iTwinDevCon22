// import { ColorDef } from "@itwin/core-common";
import { ExtensionHost } from "@itwin/core-extension";
import { ViewManager, ColorDef, AccuDrawHintBuilder, ContextRotationId, Decorator, GraphicBranch, GraphicBuilder, GraphicType, IModelConnection, RenderGraphic, StandardViewId } from "@itwin/core-extension";
import { Angle, AngleProps, AngleSweep, Arc3d, AxisIndex, ClipPlane, ClipPrimitive, ClipVector, ConvexClipPlaneSet, LinearSweep, Matrix3d, Path, Plane3dByOriginAndUnitNormal, Point3d, Range3d, Sphere, Transform, Vector2d, Vector3d, XYAndZ, XYZProps } from "@itwin/core-geometry";

  /** Proterties defining a simulated CCTV camera */
  export interface CCTVCameraProps {
    name: string,
    description?: string;
    eyePoint: XYZProps;
    targetPoint: XYZProps;
    lensAngle: AngleProps;
  }

/** Specifies options for how a camera will visualize itself */
  export interface CameraVisualOptions {
    /** Will draw an area visualizing the camera's Field Of View */
    drawFov: boolean;
    /** Will draw the camera sphere and target box in red. */
    drawTargetBox: boolean;
    /** When set to true, will use a gltf model to visualize the camera's posistion.  Otherwise, will use a black sphere. There maybe a delay before the model is visualized. */
    useCameraModel: boolean;
    /** When true, will draw a half meter wireframe box centered on the target point. */
    highVisibilty: boolean;
  }

  /** Manage the GLTF data for displaying the cameras. */
  class CameraModelManager {
    // Cached graphics or a promise of the loading
    private static _cameraGraphic: Promise<RenderGraphic | undefined> | undefined;
    /** URL to the local asset used to visualize the cameras */
    private static _defaultCameraAssetUrl = "/uploads_files_3810208_camera.glb";

    /** Tries to get graphics for the camera model, will fatch model if not cached.  The graphics will be discarded when the iModel is closed.
     * @param iModel The iModel associated with the view
     * @param url The path to the resourse to be displayed
     * @return Will resolve to an opject of the graphics.  If there was an error during allocation, will resolve to [undefined]
     */
    public static async getOrLoadGraphic(iModel: IModelConnection, url: string = CameraModelManager._defaultCameraAssetUrl): Promise<RenderGraphic | undefined> {
      if (CameraModelManager._cameraGraphic !== undefined)
        return this._cameraGraphic;
      
      // Returns a promise to the loading asset
      return CameraModelManager.loadAsset(iModel, url).then((ownedGraphics) => {
        // Replaces the previous promise with a direct resolution to the asset.
        this._cameraGraphic = Promise.resolve(ownedGraphics);

        // clean up on iModel close
        iModel.onClose.addOnce(async () => {
          let gfx: RenderGraphic | undefined;
          if (this._cameraGraphic && (gfx = await this._cameraGraphic)) {
            gfx.dispose();
          }
          this._cameraGraphic = undefined;
        });
        return ownedGraphics;
      });
    }

    private static async loadAsset(_iModel: IModelConnection, url: string): Promise<RenderGraphic | undefined> {
      // Loading asset
      let buffer: ArrayBuffer;
      try {
        // Read the file's contents into memory.
        const file = await fetch(url);
        buffer = await file.arrayBuffer();
      } catch (err) {
        console.error("Error during asset loading");
        console.error(err);
        return undefined;
      }

      // let graphic: RenderGraphic | undefined;
      // try {
      //   // Convert the glTF into a RenderGraphic.
      //   graphic = await readGltfGraphics({
      //     gltf: new Uint8Array(buffer),
      //     iModel,
      //     // pickableOptions: { id },
      //   });
      // } catch (err) {
      //   console.error("Error reading data");
      //   console.error(err);
      //   return undefined;
      // }

      // if (!graphic)
      //   return undefined;
      

      // orient into local space (facing positive along the X axis)
      const matrix = Matrix3d.createRotationAroundAxisIndex(2, Angle.createDegrees(55));
      const transform = Transform.createOriginAndMatrix(Point3d.create(-0.4,0.1,-0.45), matrix);
      const branch = new GraphicBranch();
      // branch.add(graphic);
      const alignedGraphic = ExtensionHost.renderSystem.createBranch(branch, transform)

      // Take ownership of the graphic so that it is not disposed of until we're finished with it.
      // By doing so we take responsibility for disposing of it ourselves.
      const owner = ExtensionHost.renderSystem.createGraphicOwner(alignedGraphic);

      return owner;
    }
  }

  export class CCTVCamera implements Decorator {
    /** Default options */
    public static defaultOptions: Readonly<CameraVisualOptions> = {
      drawFov: true,
      drawTargetBox: false,
      useCameraModel: true,
      highVisibilty: false,
    };
    private static readonly cameraSphereRadius = 0.2;

    // Local Props
    public name: string;
    public description: string;
    public get lensAngleDegrees(): number { return this._lensAngle.degrees; }
    private _lensAngle: Angle;
    private _eye: Point3d;
    private _target: Point3d;

    // Local Caches
    public readonly id: string;
    private _cameraModel: RenderGraphic | undefined;
    /** Calculate the bounding box for the camera and it's FOV */
    public getRange(): Range3d { 
      const [transform, distanceToTarget] = this._getTransform();
      const arc = Arc3d.createXY(Point3d.createZero(), distanceToTarget, AngleSweep.createStartEndDegrees(-this._lensAngle.degrees/2, this._lensAngle.degrees/2));
      arc.tryTransformInPlace(transform);
      return Range3d.fromJSON([arc.endPoint(), arc.startPoint(), this._eye]);
    }
    private _clearClip: VoidFunction = () => {};
    private _visualOptions: CameraVisualOptions;
    /** Returns a readonly clone of the visual options for this camera.  To modify visual options for a camera, use [setVisualOptions]. */
    public get visualOptions() : Readonly<CameraVisualOptions> {
      const options = this._visualOptions;
      return {
        drawFov: options.drawFov,
        drawTargetBox: options.drawTargetBox,
        useCameraModel: options.useCameraModel,
        highVisibilty: options.highVisibilty,
      };
    }


    /** Create a Camera
     * @param prop The camera metadata this object will be based on
     * @param iModel A connection to the iModel
     * @param visualOptions Specifies how the camera will be visualized.  If not provided will default to [SimulatedCamera.defaultOptions]
     */
    constructor(props: CCTVCameraProps, iModel: IModelConnection, visualOptions: CameraVisualOptions = CCTVCamera.defaultOptions) {
      // Copy the props
      this._eye = Point3d.fromJSON(props.eyePoint);
      this._target = Point3d.fromJSON(props.targetPoint);
      this._lensAngle = Angle.fromJSON(props.lensAngle);
      this.name = props.name;
      this.description = props.description ?? "";

      // Get Graphics for the Camera
      CameraModelManager.getOrLoadGraphic(iModel).then((modelGfx) => {
        if (!modelGfx) return;
        // transform the asset into model space
        const branch = new GraphicBranch();
        branch.add(modelGfx);
        const [transform] = this._getTransform();
        const graphic = ExtensionHost.renderSystem.createBranch(branch, transform);
        // claim ownership of the new graphics
        const owner = ExtensionHost.renderSystem.createGraphicOwner(graphic);

        this._cameraModel = owner;
        this._invalidateIfVisualized();
      });

      // Create an id to be useb for tool tips
      this.id = iModel.transientIds.next;

      // Save options or clone the default options
      this._visualOptions = {
        drawFov: visualOptions.drawFov,
        drawTargetBox: visualOptions.drawTargetBox,
        useCameraModel: visualOptions.useCameraModel,
        highVisibilty: visualOptions.highVisibilty,
      };
    }

    /** Updates the props that define this camera
     * @note To clear the description, providea a empty string
     */
    public updateProps(props: Partial<CCTVCameraProps>) {
      this._lensAngle = props.lensAngle ? Angle.fromJSON(props.lensAngle) : this._lensAngle;
      this._eye = props.eyePoint ? Point3d.fromJSON(props.eyePoint) : this._eye;
      this._target = props.targetPoint ? Point3d.fromJSON(props.targetPoint) : this._target;
      this.name = props.name ?? this.name;
      this.description = props.description ?? this.description;

      this._invalidateIfVisualized();
    }

    /** Converts this camera object to JSON */
    public toJSON(): CCTVCameraProps {
      return {
        name: this.name,
        description: this.description === "" ? undefined : this.description,
        eyePoint: this._eye.toJSONXYZ(),
        targetPoint: this._target.toJSONXYZ(),
        lensAngle: this._lensAngle.toJSON(),
      }
    }

    public dispose() {
      this._cameraModel?.dispose();
      this._cameraModel = undefined;
    }

    /** Changes the view to match that of the camera
     * @param viewport The viewport whoese view will be effected.
     */
    public viewFrom(viewport: any) {
      this.clearVisualizes();
      viewport.viewFlags = viewport.viewFlags.with("backgroundMap", false);
      if (viewport.viewport.isSpatialView()) {
        viewport.viewport.lookAt({
          eyePoint: this._eye,
            upVector: Vector3d.unitZ(),
            targetPoint: this._target,
            lensAngle: this._lensAngle,
          });

          viewport.synchWithView({ animateFrustumChange: false });
      }
    }

    /** Changes the view to be looking down on the camera from overhead.
     * @param viewport The viewport whoese view will be effected.
     */
    public viewOverhead(viewport: any) {
      this._clearClip = () => viewport.view.setViewClip(undefined);
      viewport.viewFlags = viewport.viewFlags.with("backgroundMap", false);

      if (!viewport.view.isSpatialView()) 
        return;

      viewport.setStandardRotation(StandardViewId.Top);
      const volume = Range3d.createFrom(this.getRange());
      // Scale the range slightly to increate the margins
      volume.scaleAboutCenterInPlace(1.4);
      viewport.zoomToVolume(volume);

      ViewClipApi.setClipPlane(viewport, this._eye);
      this.visualize();
      viewport.synchWithView({ animateFrustumChange: false });
    }

    /** Creates a transformation to into the model space. */
    private _getTransform(): [transform: Transform, distance: number] {
      const translation = Transform.createTranslation(this._eye);
      // vector to the end of the FOV graphics
      const distance = this._eye.distance(this._target);
      // local space vector of the arc
      const vect1 = Vector3d.unitX().scale(distance);
      // local space vector to the target
      const vect2 = Vector3d.createFrom(this._target);
      vect2.subtractInPlace(this._eye); // translation to local space

      const matrix = Matrix3d.createRotationVectorToVector(vect1, vect2);
      if (!matrix)
        // Failed to create rotational transform.  Provides tranlation matrix on failure.
        return [translation, distance];

      const transform = Transform.createRefs(this._eye, matrix);
      return [transform, distance];
    }

    /** Jumps through the hoops to enable visible edges on a branch and add it to the context */
    // private _addDecortionWithEdgesFromBuilder(builder: GraphicBuilder, context: GraphicBuilder) {
    //   const branch = new GraphicBranch(true);
    //   branch.setViewFlagOverrides({visibleEdges: true});
    //   branch.add(builder.finish());
    //   context.addDecoration(GraphicType.WorldDecoration, context.createBranch(branch, Transform.identity));
    // }

    /** If this camera is currently visualized, invalidateDecorations */
    private _invalidateIfVisualized() {
      if (ExtensionHost.viewManager.decorators.some((dec) => dec === this))
      ExtensionHost.viewManager.invalidateDecorationsAllViews();
    }
    /** Use this to chamge the visualization Op */
    public setVisualOptions(options: Partial<CameraVisualOptions>) {
      this._visualOptions.drawFov = options?.drawFov ?? this._visualOptions.drawFov;
      this._visualOptions.highVisibilty = options?.highVisibilty ?? this._visualOptions.highVisibilty;
      this._visualOptions.useCameraModel = options?.useCameraModel ?? this._visualOptions.useCameraModel;
      this._visualOptions.drawTargetBox = options?.drawTargetBox ?? this._visualOptions.drawTargetBox;

      this._invalidateIfVisualized();
    }
    /** Add the graphics for this camera.
     * @return Returns [False] if the camera is already visualized, otherwise returns [True].
    */
    public visualize(): boolean {
      try {
        ExtensionHost.viewManager.addDecorator(this);
      } catch (_) {
        return false;
      }
      return true;
    }
    /** Removes the graphics for this camera.
     * @return Returns [True] if the decorator was present and removed, otherwise [False].
     */
    public clearVisualizes() {
      this._clearClip();
      this._clearClip = ()=>{};
      return ExtensionHost.viewManager.dropDecorator(this);
    }
    /** Addes the camera visualization graphics (decorations) to a viewport. */
    public decorate(context: any) {
      // Calculate Transform into model space
      const [transform, distance] = this._getTransform();
      const options = this._visualOptions;

      // Using World Decorations so the cutting plane used by the overview will not cut the decorations
      // Drawing Field Of View
      if (this._visualOptions.drawFov) {
        // Need a builder specificlly enabled for generating edges for FOV
        const builderWithEdges = context.createGraphic({
          placement: transform,
          type: GraphicType.WorldDecoration,
          generateEdges: true,
        });
        this._drawFOV(builderWithEdges, distance);
        // this._addDecortionWithEdgesFromBuilder(builderWithEdges, context);
      }
      // Drawing Camera
      if (this._visualOptions.useCameraModel && this._cameraModel) {
        // Camera Model
        // Add bounding box for visiblity
        const builder = context.createGraphicBuilder(GraphicType.WorldOverlay, transform);
        builder.setSymbology(ColorDef.red, ColorDef.black, 1);
        builder.addRangeBox(Range3d.createXYZXYZ(-0.25,-0.7,-0.4,0.25,0.7,0.4));
        context.addDecorationFromBuilder(builder);
        // Add camera aseet graphics
        context.addDecoration(GraphicType.WorldDecoration, this._cameraModel);
      } else {
        // Camera Sphere
        let builder: GraphicBuilder;
        if (options.highVisibilty) {
          builder = context.createGraphicBuilder( GraphicType.WorldOverlay, transform, this.id);
          builder.setSymbology(ColorDef.black, ColorDef.red, 6);
        } else {
          builder = context.createGraphicBuilder(GraphicType.WorldDecoration, transform, this.id);
        }
        const sphere = Sphere.createCenterRadius(Point3d.createZero(), CCTVCamera.cameraSphereRadius);
        builder.addSolidPrimitive(sphere);
        context.addDecorationFromBuilder(builder);
      }
      // Target point
      if (options.drawTargetBox) {
        const builder = context.createGraphicBuilder(GraphicType.WorldOverlay, Transform.createTranslation(this._target));
        builder.setSymbology(options.highVisibilty ? ColorDef.red : ColorDef.black, ColorDef.black, options.highVisibilty ? 6 : 2);
        builder.addRangeBox(Range3d.createXYZXYZ(-0.25,-0.25,-0.25,0.25,0.25,0.25));
        context.addDecorationFromBuilder(builder);
      }
    }
    /** Draws the graphics for the Field Of View of the camera.  Expects the builder to transform the graphics to the correct locations */
    private _drawFOV(builder: GraphicBuilder, distance: number) {
      // setting origin at zero and will be transformed from builder
      const origin = Point3d.createZero();
      // Solve For Triangle
      const cAngle = Angle.createDegrees(180 - 90 - this._lensAngle.degrees);
      const deltaY = Math.sin(this._lensAngle.radians) * distance / Math.sin(cAngle.radians);
      const aquaTranslucent = ColorDef.fromString("#00FFFF").withTransparency(180);
      builder.setSymbology(ColorDef.black, aquaTranslucent, 3);
      builder.setSymbology(ColorDef.black, aquaTranslucent, 3);

      // Build basic shape
      const arc = Arc3d.createXY(origin, distance, AngleSweep.createStartEndDegrees(-this._lensAngle.degrees/2, this._lensAngle.degrees/2));

      const translationUp = Transform.createTranslation(Vector3d.create(0, 0, deltaY/2));
      const arcTop = arc.cloneTransformed(translationUp);
      const translationDown = Transform.createTranslation(Vector3d.create(0, 0, -deltaY/2));
      const arcBot = arc.cloneTransformed(translationDown);
      
      // Draw caps on the top and bottom
      builder.addArc(arcTop, false, true);
      builder.addArc(arcBot, false, true);

      // Draw FOV box
      builder.addShape([arcBot.startPoint(), arcBot.endPoint(), origin]);
      builder.addShape([arcTop.startPoint(), arcTop.endPoint(), origin]);
      builder.addShape([arcBot.startPoint(), arcTop.startPoint(), origin]);
      builder.addShape([arcBot.endPoint(), arcTop.endPoint(), origin]);

      // Draw arced "cap" at the end
      const curveChain = Path.create(arcBot);
      const sweep = LinearSweep.create(curveChain, Vector3d.create(0, 0, deltaY), false);
      if (!sweep) {
        console.error("Failed Building Sweep for FOV")
        return;
      }
      builder.addSolidPrimitive(sweep);
    }
  }

  class ViewClipApi {
    /* Method for clearing all clips in the viewport */
    public static clearClips(vp: any) {
      vp.view.setViewClip(undefined);
    }

    /* Method for getting a normal vector. */
    public static getPlaneInwardNormal(orientation: ContextRotationId, viewport: any): Vector3d | undefined {
      const matrix = AccuDrawHintBuilder.getContextRotation(orientation, viewport);
      if (undefined === matrix)
        return undefined;
      return matrix.getColumn(2).negate();
    }

    public static setViewClipFromClipPlaneSet(vp: any, planeSet: ConvexClipPlaneSet) {
      const prim = ClipPrimitive.createCapture(planeSet);
      const clip = ClipVector.createEmpty();
      clip.appendReference(prim);
      vp.view.setViewClip(clip);
      vp.setupFromView();
      return true;
    }

    /* Method for setting a plane as the view clip */
    public static setClipPlane(vp: any, origin: XYAndZ) {
      const rotationType = ContextRotationId.Top

      // Get the center point of the displayed extents as a starting point for the clip plane
      const point: Point3d = Point3d.fromJSON(origin);
      const normal: Vector3d | undefined = this.getPlaneInwardNormal(rotationType, vp);
      const plane: Plane3dByOriginAndUnitNormal | undefined = Plane3dByOriginAndUnitNormal.create(point, normal!);
      if (undefined === plane)
        return false;
      let planeSet: ConvexClipPlaneSet | undefined;

      if (undefined === planeSet)
        planeSet = ConvexClipPlaneSet.createEmpty();
      planeSet.addPlaneToConvexSet(ClipPlane.createPlane(plane));
      return this.setViewClipFromClipPlaneSet(vp, planeSet);
    }
  }