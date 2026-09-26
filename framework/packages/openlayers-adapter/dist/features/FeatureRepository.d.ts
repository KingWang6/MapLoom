import type { GeoJSONFeature } from "@maploom/core";
import Feature from "ol/Feature.js";
import type { Geometry } from "ol/geom.js";
import type { GeoJSONSourceManager } from "../sources/GeoJSONSourceManager";
export declare class FeatureRepository {
    private readonly sources;
    constructor(sources: GeoJSONSourceManager);
    findByRawFeature(rawFeature: GeoJSONFeature): Feature<Geometry> | null;
}
