import type { MapViewSpec } from "@maploom/core";
import OlMap from "ol/Map.js";
import type Overlay from "ol/Overlay.js";
export declare function getMapContainer(containerId: string): HTMLElement;
export declare function createOpenLayersMap(container: HTMLElement, options: MapViewSpec, overlay: Overlay): OlMap;
