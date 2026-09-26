import type {AppRuntime, PerformanceRunSummary} from "@maploom/core";
import {analysisBaseUrl} from "./appSpec";

export interface BenchmarkConfig {
    sizes?: number[];
    warmups?: number;
    runs?: number;
    includeAnalysis?: boolean;
    analysisQuery?: Record<string, unknown>;
}

export interface BenchmarkRecord extends PerformanceRunSummary {
    isWarmup: boolean;
    iteration: number;
    datasetSize?: number;
    actualFeatureCount?: number;
    memoryBeforeBytes?: number;
    memoryAfterBytes?: number;
    memoryDeltaBytes?: number;
    interactionLatencyMs?: number;
}

export interface BenchmarkResult {
    schemaVersion: "1.0";
    generatedAt: string;
    config: Required<Omit<BenchmarkConfig, "analysisQuery">> & {analysisQuery: Record<string, unknown>};
    environment: Record<string, unknown>;
    records: BenchmarkRecord[];
    summary: BenchmarkSummary[];
}

export interface BenchmarkSummary {
    task: string;
    datasetSize?: number;
    runs: number;
    successCount: number;
    failureCount: number;
    backendMs: MetricSummary | null;
    endToEndMs: MetricSummary | null;
    orchestrationOverheadMs: MetricSummary | null;
    interactionLatencyMs: MetricSummary | null;
    memoryAfterBytes: MetricSummary | null;
    memoryDeltaBytes: MetricSummary | null;
}

export interface MetricSummary {
    mean: number;
    sd: number;
    formatted: string;
}

export function installBenchmarkApi(runtime: AppRuntime): void {
    const api = {
        runAll: (config?: BenchmarkConfig) => runAll(runtime, config),
        runSmoke: () => runAll(runtime, {sizes: [1000], warmups: 0, runs: 1, includeAnalysis: true}),
        toCsv,
        download: (result: BenchmarkResult, prefix = "maploom-performance") => downloadResult(result, prefix)
    };
    (window as any).maploomBenchmark = api;
}

async function runAll(runtime: AppRuntime, input: BenchmarkConfig = {}): Promise<BenchmarkResult> {
    const config = {
        sizes: normalizeSizes(input.sizes ?? [1000, 5000, 10000]),
        warmups: nonNegativeInteger(input.warmups ?? 3, "warmups"),
        runs: positiveInteger(input.runs ?? 10, "runs"),
        includeAnalysis: input.includeAnalysis ?? true,
        analysisQuery: input.analysisQuery ?? {district: "玄武区"}
    };
    const records: BenchmarkRecord[] = [];
    runtime.performance.clear();

    for (const size of config.sizes) {
        await repeat(config.warmups, config.runs, async (isWarmup, iteration) => {
            records.push(await runPoiLoad(runtime, size, isWarmup, iteration));
            records.push(await runFeatureInteraction(runtime, size, isWarmup, iteration));
        });
    }

    if (config.includeAnalysis) {
        await repeat(config.warmups, config.runs, async (isWarmup, iteration) => {
            records.push(await runAnalysis(runtime, "grid-density", "widget.gridAnalysis.run", {
                sourceLayer: "poiLayer", gridSizeMeters: 1000, query: config.analysisQuery
            }, isWarmup, iteration));
            records.push(await runAnalysis(runtime, "dbscan", "widget.hotspotAnalysis.run", {
                sourceLayer: "poiLayer", epsMeters: 800, minPoints: 10, query: config.analysisQuery
            }, isWarmup, iteration));
            records.push(await runAnalysis(runtime, "ufz", "widget.functionAnalysis.run", {
                sourceLayer: "poiLayer", gridSizeMeters: 1000, minPoi: 10, mixedThreshold: 0.7,
                query: config.analysisQuery
            }, isWarmup, iteration));
        });
    }

    return {
        schemaVersion: "1.0",
        generatedAt: new Date().toISOString(),
        config,
        environment: await collectEnvironment(),
        records,
        summary: summarize(records.filter(record => !record.isWarmup))
    };
}

async function runPoiLoad(
    runtime: AppRuntime,
    size: number,
    isWarmup: boolean,
    iteration: number
): Promise<BenchmarkRecord> {
    const memoryBeforeBytes = heapBytes();
    const trace = runtime.performance.start("poi-query", {datasetSize: size, isWarmup, iteration});
    await runtime.emitAsync("widget.poiFilter.filter-change", {
        query: {limit: size, sample: "proportional"},
        filter: {operator: "all"},
        __performance: trace
    });
    await runtime.performance.waitFor(trace.runId);
    const memoryAfterBytes = heapBytes();
    const featureCount = runtime.getLayerFeatures("poiLayer")?.features.length;
    return enrich(runtime.performance.getRun(trace.runId)!, {
        isWarmup,
        iteration,
        datasetSize: size,
        actualFeatureCount: featureCount,
        memoryBeforeBytes,
        memoryAfterBytes,
        memoryDeltaBytes: difference(memoryAfterBytes, memoryBeforeBytes)
    });
}

async function runFeatureInteraction(
    runtime: AppRuntime,
    size: number,
    isWarmup: boolean,
    iteration: number
): Promise<BenchmarkRecord> {
    const features = runtime.getLayerFeatures("poiLayer")?.features ?? [];
    const traceRef = runtime.performance.start("feature-interaction", {datasetSize: size, isWarmup, iteration});
    const trace = runtime.performance.trace(traceRef);
    if (!features.length) {
        trace.mark("T3", {status: "error", metadata: {error: "POI layer contains no feature"}});
        return enrich(runtime.performance.getRun(trace.runId)!, {
            isWarmup, iteration, datasetSize: size, actualFeatureCount: 0
        });
    }
    const feature = features[Math.floor(features.length / 2)];
    await runtime.emitAsync("benchmark.poi-feature-interaction", {feature, __performance: traceRef});
    await runtime.whenMapRenderReady();
    trace.mark("T3", {status: "success"});
    const run = runtime.performance.getRun(trace.runId)!;
    return enrich(run, {
        isWarmup,
        iteration,
        datasetSize: size,
        actualFeatureCount: features.length,
        interactionLatencyMs: run.endToEndMs
    });
}

async function runAnalysis(
    runtime: AppRuntime,
    task: string,
    eventName: string,
    payload: Record<string, unknown>,
    isWarmup: boolean,
    iteration: number
): Promise<BenchmarkRecord> {
    const trace = runtime.performance.start(task, {isWarmup, iteration, ...payload});
    await runtime.emitAsync(eventName, {...payload, __performance: trace});
    await runtime.performance.waitFor(trace.runId);
    return enrich(runtime.performance.getRun(trace.runId)!, {isWarmup, iteration});
}

async function repeat(
    warmups: number,
    runs: number,
    operation: (isWarmup: boolean, iteration: number) => Promise<void>
): Promise<void> {
    for (let index = 0; index < warmups + runs; index += 1) {
        await operation(index < warmups, index < warmups ? index + 1 : index - warmups + 1);
    }
}

function summarize(records: BenchmarkRecord[]): BenchmarkSummary[] {
    const groups = new Map<string, BenchmarkRecord[]>();
    for (const record of records) {
        const key = `${record.task}|${record.datasetSize ?? "analysis"}`;
        groups.set(key, [...(groups.get(key) ?? []), record]);
    }
    return [...groups.values()].map(group => ({
        task: group[0].task,
        datasetSize: group[0].datasetSize,
        runs: group.length,
        successCount: group.filter(record => record.status === "success").length,
        failureCount: group.filter(record => record.status === "error").length,
        backendMs: metric(group, "backendMs"),
        endToEndMs: metric(group, "endToEndMs"),
        orchestrationOverheadMs: metric(group, "orchestrationOverheadMs"),
        interactionLatencyMs: metric(group, "interactionLatencyMs"),
        memoryAfterBytes: metric(group, "memoryAfterBytes"),
        memoryDeltaBytes: metric(group, "memoryDeltaBytes")
    }));
}

function metric(records: BenchmarkRecord[], field: keyof BenchmarkRecord): MetricSummary | null {
    const values = records.map(record => record[field]).filter((value): value is number => typeof value === "number");
    if (!values.length) return null;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.length > 1
        ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
        : 0;
    const sd = Math.sqrt(variance);
    return {mean, sd, formatted: `${mean.toFixed(2)} ± ${sd.toFixed(2)}`};
}

function toCsv(result: BenchmarkResult): string {
    const columns: Array<keyof BenchmarkRecord> = [
        "task", "datasetSize", "isWarmup", "iteration", "status", "actualFeatureCount",
        "t0", "t1", "t2", "t3", "backendMs", "endToEndMs", "orchestrationOverheadMs",
        "interactionLatencyMs", "memoryBeforeBytes", "memoryAfterBytes", "memoryDeltaBytes"
    ];
    const rows = result.records.map(record => columns.map(column => csvCell(record[column])).join(","));
    return [columns.join(","), ...rows].join("\r\n");
}

function downloadResult(result: BenchmarkResult, prefix: string): void {
    const stamp = result.generatedAt.replace(/[:.]/g, "-");
    downloadBlob(`${prefix}-${stamp}.json`, JSON.stringify(result, null, 2), "application/json");
    downloadBlob(`${prefix}-${stamp}.csv`, toCsv(result), "text/csv;charset=utf-8");
}

async function collectEnvironment(): Promise<Record<string, unknown>> {
    let service: unknown = null;
    try {
        const response = await fetch(`${analysisBaseUrl}/api/benchmark/environment`);
        if (response.ok) service = await response.json();
    } catch {
        service = {available: false};
    }
    return {
        browser: navigator.userAgent,
        platform: navigator.platform,
        logicalProcessors: navigator.hardwareConcurrency,
        deviceMemoryGiB: (navigator as any).deviceMemory ?? null,
        viewport: {width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio},
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        jsHeapMeasurementAvailable: heapBytes() !== undefined,
        pageUrl: window.location.href,
        service
    };
}

function heapBytes(): number | undefined {
    const memory = (performance as any).memory;
    return typeof memory?.usedJSHeapSize === "number" ? memory.usedJSHeapSize : undefined;
}

function enrich(run: PerformanceRunSummary, extra: Omit<BenchmarkRecord, keyof PerformanceRunSummary>): BenchmarkRecord {
    return {...run, ...extra};
}

function difference(end?: number, start?: number): number | undefined {
    return end === undefined || start === undefined ? undefined : end - start;
}

function normalizeSizes(sizes: number[]): number[] {
    const normalized = [...new Set(sizes.map(size => positiveInteger(size, "dataset size")))];
    if (!normalized.length) throw new Error("At least one dataset size is required");
    return normalized;
}

function positiveInteger(value: number, name: string): number {
    if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
    return value;
}

function nonNegativeInteger(value: number, name: string): number {
    if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
    return value;
}

function csvCell(value: unknown): string {
    if (value === undefined || value === null) return "";
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadBlob(filename: string, content: string, type: string): void {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}
