import type { GeoJSONFeatureCollection } from "@maploom/core";
export interface DbscanSummary {
    featureCount: number;
    clusterCount: number;
    noiseCount: number;
}
export interface DbscanRankingItem {
    clusterId: number;
    count: number;
    rank: number;
}
export interface DbscanAnalysisResponse {
    algorithm: string;
    featureCollection: GeoJSONFeatureCollection;
    centersFeatureCollection?: GeoJSONFeatureCollection;
    hullsFeatureCollection?: GeoJSONFeatureCollection;
    centerFeatureCollection?: GeoJSONFeatureCollection;
    hullFeatureCollection?: GeoJSONFeatureCollection;
    clusterCenters?: GeoJSONFeatureCollection;
    clusterHulls?: GeoJSONFeatureCollection;
    ranking?: DbscanRankingItem[];
    summary: DbscanSummary;
}
export interface DbscanAnalysisState {
    status: "idle" | "running" | "success" | "error";
    /** Only present when work is actually complete; running work is indeterminate. */
    progress?: number;
    phase?: "preparing" | "processing" | "rendering" | "completed" | "failed";
    message?: string;
    startedAt?: number;
    durationMs?: number;
    algorithm?: string;
    summary?: DbscanSummary;
    resultLayerId?: string;
    centerLayerId?: string;
    hullLayerId?: string;
    ranking?: DbscanRankingItem[];
    error?: string;
    errorCode?: string;
    suggestion?: string;
    retryable?: boolean;
}
