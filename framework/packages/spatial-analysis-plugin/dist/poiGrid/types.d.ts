import type { GeoJSONFeatureCollection } from "@maploom/core";
export interface PoiGridAnalysisInput {
    featureCollection: GeoJSONFeatureCollection;
    gridSizeMeters: number;
    category?: string;
    district?: string;
    query?: Record<string, unknown>;
}
export interface PoiGridSummary {
    gridCount?: number;
    poiCount?: number;
    maxDensity?: number;
    averageDensity?: number;
    [key: string]: unknown;
}
export interface PoiGridAnalysisResponse {
    featureCollection: GeoJSONFeatureCollection;
    summary: PoiGridSummary;
}
export interface PoiGridAnalysisState {
    status: "idle" | "running" | "success" | "error";
    summary?: PoiGridSummary;
    resultLayerId?: string;
    error?: string;
}
