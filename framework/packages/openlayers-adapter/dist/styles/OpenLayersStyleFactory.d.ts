import type { StyleSpec } from "@maploom/core";
import Feature from "ol/Feature.js";
import type { Geometry } from "ol/geom.js";
import Style from "ol/style/Style.js";
export declare class OpenLayersStyleFactory {
    createDynamic(feature: Feature<Geometry>, style?: StyleSpec): Style;
    create(style?: StyleSpec): Style;
}
