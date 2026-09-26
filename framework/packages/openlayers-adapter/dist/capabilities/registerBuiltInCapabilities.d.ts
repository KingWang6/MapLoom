import type OlMap from "ol/Map.js";
import type { FeatureRepository } from "../features/FeatureRepository";
import type { VectorLayerManager } from "../layers/VectorLayerManager";
import type { GeoJSONSourceManager } from "../sources/GeoJSONSourceManager";
import type { PopupController } from "../popup/PopupController";
import type { HighlightController } from "../selection/HighlightController";
import type { CapabilityRegistry } from "./CapabilityRegistry";
export interface BuiltInCapabilityDependencies {
    getMap: () => OlMap;
    features: FeatureRepository;
    highlights: HighlightController;
    popup: PopupController;
    layers: VectorLayerManager;
    sources: GeoJSONSourceManager;
}
export declare function registerBuiltInCapabilities(registry: CapabilityRegistry, dependencies: BuiltInCapabilityDependencies): void;
