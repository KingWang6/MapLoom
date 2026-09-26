import type { ActionSpec, InteractionSpec, MapEngineAdapter, WidgetSpec } from "../schema/types";
import type { EventBus } from "../runtime/EventBus";
import type { StateStore } from "../runtime/StateStore";
import type { PerformanceRecorder, PerformanceTrace } from "../runtime/PerformanceRecorder";
export interface ActionContext {
    event?: any;
    state: StateStore;
    map: MapEngineAdapter;
    eventBus: EventBus;
    resolveValue: (value: any, context: ActionContext) => any;
    performance?: PerformanceTrace;
}
export interface ActionHandler {
    execute(action: any, context: ActionContext): void | Promise<void>;
}
export interface WidgetMountContext {
    spec: WidgetSpec;
    appSpec: any;
    map: MapEngineAdapter;
    state: StateStore;
    eventBus: EventBus;
    performance: PerformanceRecorder;
}
export interface WidgetFactory {
    mount(container: HTMLElement, context: WidgetMountContext): void;
}
export interface InteractionContext {
    map: MapEngineAdapter;
    state: StateStore;
    eventBus: EventBus;
    executeAction(action: ActionSpec, context: {
        event?: any;
    }): Promise<void>;
}
export interface InteractionHandler {
    bind(interaction: InteractionSpec, context: InteractionContext): void;
}
/**
 * 插件上下文
 */
export interface PluginContext {
    registerAction(type: string, handler: ActionHandler): void;
    registerWidget(type: string, factory: WidgetFactory): void;
    registerInteraction(type: string, handler: InteractionHandler): void;
}
export type MapLoomSchemaRef = string | Record<string, unknown>;
export interface MapLoomExampleRef {
    title?: string;
    description?: string;
    path?: string;
    value?: unknown;
}
export interface MapLoomEventManifest {
    event: string;
    description?: string;
    payloadSchema?: MapLoomSchemaRef;
    example?: unknown;
}
export interface MapLoomCapabilityDependency {
    type: string;
    adapter?: string;
    required?: boolean;
}
export interface MapLoomWidgetManifest {
    type: string;
    title?: string;
    description: string;
    schema?: MapLoomSchemaRef;
    appSpec?: unknown;
    emits?: MapLoomEventManifest[];
    examples?: MapLoomExampleRef[];
}
export interface MapLoomActionManifest {
    type: string;
    title?: string;
    description: string;
    schema?: MapLoomSchemaRef;
    appSpec?: unknown;
    requiresCapabilities?: MapLoomCapabilityDependency[];
    examples?: MapLoomExampleRef[];
}
export interface MapLoomCapabilityManifest {
    type: string;
    title?: string;
    description: string;
    adapter?: string;
    inputSchema?: MapLoomSchemaRef;
    outputSchema?: MapLoomSchemaRef;
    examples?: MapLoomExampleRef[];
}
export interface MapLoomTemplateManifest {
    id: string;
    title: string;
    description: string;
    appSpec: string;
    theme?: string;
    data?: string[];
    tags?: string[];
}
export interface MapLoomTypedCapabilityManifest {
    type: string;
    title?: string;
    description: string;
    schema?: MapLoomSchemaRef;
    examples?: MapLoomExampleRef[];
}
export interface PluginManifest {
    schemaVersion?: "1.0";
    name?: string;
    displayName?: string;
    version?: string;
    description?: string;
    author?: string;
    frameworkVersion?: string;
    packageName?: string;
    homepage?: string;
    repository?: string;
    keywords?: string[];
    categories?: string[];
    actions?: MapLoomActionManifest[];
    widgets?: MapLoomWidgetManifest[];
    capabilities?: MapLoomCapabilityManifest[];
    sources?: MapLoomTypedCapabilityManifest[];
    layers?: MapLoomTypedCapabilityManifest[];
    styles?: MapLoomTypedCapabilityManifest[];
    interactions?: MapLoomTypedCapabilityManifest[];
    templates?: MapLoomTemplateManifest[];
}
export interface MapLoopPlugin {
    name: string;
    version?: string;
    manifest?: PluginManifest;
    setup(context: PluginContext): void;
}
