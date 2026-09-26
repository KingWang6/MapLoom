import type { GeoJSONFeature, StyleSpec } from "@maploom/core";
import type { FeatureRepository } from "../features/FeatureRepository";
import type { OpenLayersStyleFactory } from "../styles/OpenLayersStyleFactory";
export declare class HighlightController {
    private readonly features;
    private readonly styles;
    private highlightedFeature;
    private previousStyle;
    constructor(features: FeatureRepository, styles: OpenLayersStyleFactory);
    highlight(feature: GeoJSONFeature, style?: StyleSpec): void;
    clear(): void;
}
