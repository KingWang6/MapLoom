import type { FeatureClickHandler } from "@maploom/core";
import type OlMap from "ol/Map.js";
export declare class FeatureClickController {
    private handlers;
    register(layerId: string, handler: FeatureClickHandler): void;
    bind(map: OlMap, onUnhandled: () => void): void;
}
