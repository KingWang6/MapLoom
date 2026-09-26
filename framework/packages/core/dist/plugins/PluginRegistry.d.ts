import { ActionHandler, InteractionHandler, MapLoopPlugin, PluginManifest, WidgetFactory } from "./Plugin";
export declare class PluginRegistry {
    private actions;
    private widgets;
    private interactions;
    private plugins;
    use(plugin: MapLoopPlugin): void;
    registerAction(type: string, handler: ActionHandler): void;
    registerWidget(type: string, factory: WidgetFactory): void;
    registerInteraction(type: string, handler: InteractionHandler): void;
    getAction(type: string): ActionHandler | undefined;
    getWidget(type: string): WidgetFactory | undefined;
    getInteraction(type: string): InteractionHandler | undefined;
    listActions(): string[];
    listWidgets(): string[];
    listInteractions(): string[];
    listPlugins(): string[];
    getManifests(): PluginManifest[];
    getManifest(pluginName: string): PluginManifest | undefined;
}
