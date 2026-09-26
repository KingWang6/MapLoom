import type { GeoJSONFeatureCollection } from "@maploom/core";
import type { DbscanAnalysisResponse } from "../clustering/types";
import type { SiteSelectionInput, SiteSelectionResponse } from "../siteSelection/types";
import type { PoiGridAnalysisInput, PoiGridAnalysisResponse } from "../poiGrid/types";
import type { UrbanFunctionAnalysisInput, UrbanFunctionAnalysisResponse } from "../urbanFunction/types";
export interface DbscanAnalysisInput {
    featureCollection?: GeoJSONFeatureCollection;
    epsMeters: number;
    minPoints: number;
    query?: Record<string, unknown>;
}
export declare class SpatialAnalysisRequestError extends Error {
    readonly code: string;
    readonly suggestion: string;
    readonly retryable: boolean;
    readonly status?: number | undefined;
    constructor(message: string, code: string, suggestion: string, retryable: boolean, status?: number | undefined);
}
export declare class HttpSpatialAnalysisClient {
    private readonly endpoint;
    constructor(endpoint: string);
    verifyDbscanAlgorithm(expected: string): Promise<void>;
    runDbscan(input: DbscanAnalysisInput): Promise<DbscanAnalysisResponse>;
    runSiteSelection(input: SiteSelectionInput): Promise<SiteSelectionResponse>;
    runPoiGrid(input: PoiGridAnalysisInput): Promise<PoiGridAnalysisResponse>;
    runUrbanFunction(input: UrbanFunctionAnalysisInput): Promise<UrbanFunctionAnalysisResponse>;
    private post;
}
