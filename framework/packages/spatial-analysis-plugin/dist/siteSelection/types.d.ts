import type { GeoJSONFeatureCollection } from "@maploom/core";
export interface SiteSelectionWeights {
    coverage: number;
    capacity: number;
    safety: number;
}
export interface SiteSelectionInput {
    candidateCollection: GeoJSONFeatureCollection;
    demandCollection: GeoJSONFeatureCollection;
    riskCollection: GeoJSONFeatureCollection;
    serviceRadiusMeters: number;
    weights: SiteSelectionWeights;
}
export interface SiteSelectionRankingItem {
    id: string;
    name: string;
    rank: number;
    totalScore: number;
    coveredPopulation: number;
    safetyScore: number;
    capacity: number;
}
export interface SiteSelectionSummary {
    candidateCount: number;
    recommendedId: string;
    recommendedName: string;
    maxScore: number;
    serviceRadiusMeters: number;
}
export interface SiteSelectionResponse {
    featureCollection: GeoJSONFeatureCollection;
    summary: SiteSelectionSummary;
    ranking: SiteSelectionRankingItem[];
}
export interface SiteSelectionState {
    status: "idle" | "running" | "completed" | "failed";
    summary?: SiteSelectionSummary;
    ranking?: SiteSelectionRankingItem[];
    resultLayerId?: string;
    error?: string;
}
