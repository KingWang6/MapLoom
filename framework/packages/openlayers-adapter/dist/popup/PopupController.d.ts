import type { GeoJSONFeature, PopupOptions } from "@maploom/core";
import type OlMap from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import type { FeatureRepository } from "../features/FeatureRepository";
export declare class PopupController {
    private readonly getMap;
    private readonly features;
    private overlay;
    private popupEl;
    constructor(getMap: () => OlMap, features: FeatureRepository);
    initialize(container: HTMLElement): Overlay;
    show(feature: GeoJSONFeature, options: PopupOptions): void;
    hide(): void;
}
