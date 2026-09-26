import type { GeoJSONFeatureCollection } from "@maploom/core";
export interface UrbanFunctionAnalysisInput {
    featureCollection: GeoJSONFeatureCollection;
    gridSizeMeters: number;
    minPoi: number;
    mixedThreshold: number;
    category?: string;
    district?: string;
    query?: Record<string, unknown>;
}
export interface UrbanFunctionSummary {
    gridCount?: number;
    lowSampleCount?: number;
    mixedGridCount?: number;
    functionCounts?: Record<string, number>;
    representativeGrids?: Array<Record<string, unknown>>;
    typicalGrids?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}
export interface UrbanFunctionAnalysisResponse {
    featureCollection: GeoJSONFeatureCollection;
    summary: UrbanFunctionSummary;
}
export interface UrbanFunctionAnalysisState {
    status: "idle" | "running" | "success" | "error";
    summary?: UrbanFunctionSummary;
    resultLayerId?: string;
    functionLayerId?: string;
    mixedLayerId?: string;
    activeLayerMode?: "function" | "mix";
    error?: string;
}
