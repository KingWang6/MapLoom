import type { SourceSpec } from "@maploom/core";
import type { OLVectorSource } from "../types";
export declare class GeoJSONSourceManager {
    private sources;
    private specs;
    add(source: SourceSpec): void;
    refresh(sourceId: string, options?: {
        url?: string;
        query?: Record<string, unknown>;
    }): Promise<{
        featureCount: number;
    }>;
    private replaceFeatures;
    get(sourceId: string): OLVectorSource | undefined;
    values(): IterableIterator<OLVectorSource>;
}
