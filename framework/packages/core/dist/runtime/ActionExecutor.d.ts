import type { ActionSpec, MapEngineAdapter } from "../schema/types";
import type { EventBus } from "./EventBus";
import type { StateStore } from "./StateStore";
import { PluginRegistry } from "../plugins/PluginRegistry";
import type { PerformanceRecorder } from "./PerformanceRecorder";
export declare class ActionExecutor {
    private mapAdapter;
    private stateStore;
    private eventBus;
    private registry;
    private performanceRecorder;
    constructor(mapAdapter: MapEngineAdapter, stateStore: StateStore, eventBus: EventBus, registry: PluginRegistry, performanceRecorder: PerformanceRecorder);
    execute(action: ActionSpec, context: any): Promise<void>;
    private resolvePerformanceTrace;
    private resolveValue;
    private resolveObject;
    private getByPath;
}
