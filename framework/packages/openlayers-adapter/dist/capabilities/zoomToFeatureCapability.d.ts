import type OlMap from "ol/Map.js";
import type { FeatureRepository } from "../features/FeatureRepository";
import type { CapabilityRegistry } from "./CapabilityRegistry";
export declare function registerZoomToFeatureCapability(registry: CapabilityRegistry, getMap: () => OlMap, features: FeatureRepository): void;
