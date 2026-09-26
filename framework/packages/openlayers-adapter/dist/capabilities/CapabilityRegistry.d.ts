import type { CapabilityHandler } from "@maploom/core";
export declare class CapabilityRegistry {
    private capabilities;
    register(type: string, handler: CapabilityHandler): void;
    supports(type: string): boolean;
    execute(type: string, payload?: unknown): unknown;
    list(): string[];
}
