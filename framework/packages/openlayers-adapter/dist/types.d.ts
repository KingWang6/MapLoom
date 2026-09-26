import Feature from "ol/Feature.js";
import type { Geometry } from "ol/geom.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
export type OLVectorSource = VectorSource<Feature<Geometry>>;
export type OLVectorLayer = VectorLayer<OLVectorSource>;
