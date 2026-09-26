export declare class StateStore {
    private state;
    private listeners;
    constructor(initialState?: Record<string, unknown>);
    get(path?: string): any;
    set(path: string, value: any): void;
    subscribe(listener: () => void): () => void;
    private notify;
}
