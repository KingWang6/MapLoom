import type { CapabilityHandler, FeatureClickHandler, GeoJSONFeature, GeoJSONFeatureCollection, LayerSpec, MapEngineAdapter, MapViewSpec, PopupOptions, SourceSpec, StyleSpec } from "@maploom/core";
export declare class OpenLayersAdapter implements MapEngineAdapter {
    private map;
    private readonly capabilities;
    private readonly sources;
    private readonly styles;
    private readonly features;
    private readonly layers;
    private readonly highlights;
    private readonly popup;
    private readonly featureClicks;
    constructor();
    createMap(options: MapViewSpec): void;
    addSource(source: SourceSpec): void;
    addLayer(layer: LayerSpec): void;
    render(): void;
    whenRenderReady(): Promise<void>;
    setLayerVisible(layerId: string, visible: boolean): void;
    getLayerFeatures(layerId: string): GeoJSONFeatureCollection | null;
    onFeatureClick(layerId: string, handler: FeatureClickHandler): void;
    highlightFeature(feature: GeoJSONFeature, style?: StyleSpec): void;
    showPopup(feature: GeoJSONFeature, options: PopupOptions): void;
    registerCapability(type: string, handler: CapabilityHandler): void;
    supportsCapability(type: string): boolean;
    executeCapability(type: string, payload?: unknown): unknown;
    listCapabilities(): string[];
}
