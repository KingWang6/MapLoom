/**
 * HTML 转义，用于把来自数据（如 GeoJSON 属性、用户输入）的值安全地拼进 innerHTML。
 * 框架层统一提供一份实现，插件与适配器共用，避免各自为政。
 */
export declare function escapeHtml(value: unknown): string;
