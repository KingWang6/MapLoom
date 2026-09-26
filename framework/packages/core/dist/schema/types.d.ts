export type Coordinate = [number, number];
export interface AppSpec {
    version: string;
    map: MapViewSpec;
    sources: SourceSpec[];
    layers: LayerSpec[];
    widgets?: WidgetSpec[];
    interactions?: InteractionSpec[];
    bindings?: BindingSpec[];
    state?: Record<string, unknown>;
}
export interface MapViewSpec {
    container: string;
    center: Coordinate;
    zoom: number;
}
export type SourceSpec = GeoJSONSourceSpec;
export interface GeoJSONSourceSpec {
    id: string;
    type: "geojson";
    data?: GeoJSONFeatureCollection;
    /** Optional HTTP endpoint returning a GeoJSON FeatureCollection. */
    url?: string;
    /** Static query parameters used for the initial remote request. */
    query?: Record<string, string | number | boolean | undefined>;
}
export interface LayerSpec {
    id: string;
    title?: string;
    type: "vector";
    source: string;
    visible?: boolean;
    style?: StyleSpec;
}
export interface StyleSpec {
    type?: "simple" | "category" | "class-breaks";
    field?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    radius?: number;
    color?: string;
    rules?: Record<string, StyleSpec>;
    breaks?: Array<{
        min: number;
        max: number;
        style?: StyleSpec;
        fillColor?: string;
        strokeColor?: string;
        color?: string;
        radius?: number;
    }>;
    default?: StyleSpec;
}
export interface WidgetSpec {
    id: string;
    type: string;
    region: "left" | "right" | "bottom" | "top";
    title?: string;
    className?: string;
    [key: string]: unknown;
}
export interface InteractionSpec {
    id: string;
    type: string;
    targetLayer?: string;
    actions: ActionSpec[];
    [key: string]: unknown;
}
export interface BindingSpec {
    event: string;
    actions: ActionSpec[];
}
export interface ActionSpec {
    type: string;
    [key: string]: unknown;
}
export interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}
export interface GeoJSONFeature {
    id?: string;
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: GeoJSONGeometry;
}
export type PopupFieldSpec = string | {
    field: string;
    label?: string;
};
export interface PopupOptions {
    fields: PopupFieldSpec[];
    valueLabels?: Record<string, Record<string, string>>;
    x?: number;
    y?: number;
}
export type GeoJSONGeometry = {
    type: "Point";
    coordinates: Coordinate;
} | {
    type: "LineString";
    coordinates: Coordinate[];
} | {
    type: "Polygon";
    coordinates: Coordinate[][];
} | {
    type: "MultiPoint";
    coordinates: Coordinate[];
} | {
    type: "MultiLineString";
    coordinates: Coordinate[][];
} | {
    type: "MultiPolygon";
    coordinates: Coordinate[][][];
};
export interface MapPointerEvent {
    x: number;
    y: number;
    originalEvent: MouseEvent;
}
export type FeatureClickHandler = (feature: GeoJSONFeature, event: MapPointerEvent) => void;
export interface CapabilityHandler {
    execute(payload?: unknown): unknown;
}
export interface MapEngineAdapter {
    createMap(options: MapViewSpec): void;
    addSource(source: SourceSpec): void;
    addLayer(layer: LayerSpec): void;
    render(): void;
    /** Resolve after the map has painted the latest source/layer/state changes. */
    whenRenderReady?(): Promise<void>;
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
