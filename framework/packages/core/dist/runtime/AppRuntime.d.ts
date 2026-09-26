import type { AppSpec, MapEngineAdapter } from "../schema/types";
import type { MapLoopPlugin } from "../plugins/Plugin";
import { PerformanceRecorder } from "./PerformanceRecorder";
export declare class AppRuntime {
    private spec;
    private mapAdapter;
    private stateStore;
    private eventBus;
    private registry;
    private actionExecutor;
    private uiRuntime;
    readonly performance: PerformanceRecorder;
    constructor(spec: AppSpec, mapAdapter: MapEngineAdapter);
    use(plugin: MapLoopPlugin): this;
    mount(): void;
    getState(path?: string): any;
    setState(path: string, value: any): void;
    emit(eventName: string, payload?: any): void;
    emitAsync(eventName: string, payload?: any): Promise<void>;
    getLayerFeatures(layerId: string): import("..").GeoJSONFeatureCollection | null;
    whenMapRenderReady(): Promise<void>;
    on(eventName: string, handler: (payload: any) => void): () => void;
    /**
     * 根据 AppSpec 中的 interactions 配置，建立 地图事件(由MapAdapter处理) 与  Action 之间的关联
     * @private
     */
    private bindMapInteractions;
    /**
     * 根据 AppSpec 中的 bindings 配置，建立 Widget事件(内部主动触发) 与  Action 之间的关联
     * @private
     */
    private bindEventBindings;
}
