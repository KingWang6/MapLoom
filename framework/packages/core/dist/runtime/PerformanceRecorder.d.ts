export type PerformancePhase = "T0" | "T1" | "T2" | "T3";
export interface PerformanceTraceRef {
    runId: string;
    task: string;
}
export interface PerformanceEntry extends PerformanceTraceRef {
    phase: PerformancePhase;
    timestamp: number;
    epochMs: number;
    status?: "running" | "success" | "error";
    metadata?: Record<string, unknown>;
}
export interface PerformanceRunSummary extends PerformanceTraceRef {
    status: "running" | "success" | "error";
    t0?: number;
    t1?: number;
    t2?: number;
    t3?: number;
    backendMs?: number;
    endToEndMs?: number;
    orchestrationOverheadMs?: number;
    metadata: Record<string, unknown>;
}
export interface PerformanceTrace extends PerformanceTraceRef {
    mark(phase: Exclude<PerformancePhase, "T0">, options?: {
        status?: PerformanceEntry["status"];
        metadata?: Record<string, unknown>;
    }): PerformanceEntry;
}
type PerformanceListener = (entry: PerformanceEntry) => void;
export declare class PerformanceRecorder {
    private readonly entries;
    private readonly listeners;
    private sequence;
    start(task: string, metadata?: Record<string, unknown>, runId?: string): PerformanceTraceRef;
    trace(trace: PerformanceTraceRef): PerformanceTrace;
    getEntries(): PerformanceEntry[];
    getRun(runId: string): PerformanceRunSummary | undefined;
    clear(): void;
    subscribe(listener: PerformanceListener): () => void;
    waitFor(runId: string, phase?: PerformancePhase, timeoutMs?: number): Promise<PerformanceEntry>;
    private record;
    private createRunId;
}
export {};
