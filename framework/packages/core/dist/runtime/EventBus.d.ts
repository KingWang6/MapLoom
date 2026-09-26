export type EventHandler = (payload: any) => void | Promise<void>;
export declare class EventBus {
    private handlers;
    on(eventName: string, handler: EventHandler): () => void;
    emit(eventName: string, payload?: any): void;
    emitAsync(eventName: string, payload?: any): Promise<void>;
}
