import type { AppSpec, MapEngineAdapter } from "../schema/types";
import type { EventBus } from "../runtime/EventBus";
import type { StateStore } from "../runtime/StateStore";
import { PluginRegistry } from "../plugins/PluginRegistry";
import type { PerformanceRecorder } from "../runtime/PerformanceRecorder";
export declare class UiRuntime {
    private spec;
    private mapAdapter;
    private eventBus;
    private stateStore;
    private registry;
    private performance;
    constructor(spec: AppSpec, mapAdapter: MapEngineAdapter, eventBus: EventBus, stateStore: StateStore, registry: PluginRegistry, performance: PerformanceRecorder);
    mount(): void;
    private mountWidget;
    private getRegionContainer;
}
