import type { GeoJSONFeatureCollection, LayerSpec, StyleSpec } from "@maploom/core";
import type OlMap from "ol/Map.js";
import type { GeoJSONSourceManager } from "../sources/GeoJSONSourceManager";
import type { OpenLayersStyleFactory } from "../styles/OpenLayersStyleFactory";
export declare class VectorLayerManager {
    private readonly getMap;
    private readonly sources;
    private readonly styles;
    private layers;
    private layerSpecs;
    constructor(getMap: () => OlMap, sources: GeoJSONSourceManager, styles: OpenLayersStyleFactory);
    add(layer: LayerSpec): void;
    setVisible(layerId: string, visible: boolean): void;
    getFeatures(layerId: string): GeoJSONFeatureCollection | null;
    filter(layerId: string, filter: any): void;
    setStyle(layerId: string, style?: StyleSpec): void;
}
